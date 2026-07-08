import * as ts from 'typescript'

export interface InsertionContext {
  source: string
  offset: number
  currentLine: number
}

// Kinds to consider when deciding expression boundary
const targetKinds = new Set<ts.SyntaxKind>([
  ts.SyntaxKind.CallExpression,
  ts.SyntaxKind.NewExpression,
  ts.SyntaxKind.ObjectLiteralExpression,
  ts.SyntaxKind.ArrayLiteralExpression,
  ts.SyntaxKind.ParenthesizedExpression,
  ts.SyntaxKind.ArrowFunction,
])

const vueOptionContainerProperties = new Set([
  'components',
  'computed',
  'directives',
  'filters',
  'inject',
  'methods',
  'props',
  'provide',
  'watch',
])

export function computeInsertionLine(ctx: InsertionContext): number | undefined {
  let { source, offset, currentLine } = ctx
  let lineOffset = 0
  let isVueScript = false

  const scriptRE = /<script\b[^>]*>/gi
  let scriptStart = -1
  for (let match = scriptRE.exec(source); match && match.index <= offset; match = scriptRE.exec(source)) {
    scriptStart = match.index + match[0].length
  }

  const scriptEnd = scriptStart === -1 ? -1 : source.indexOf('</script>', scriptStart)
  if (scriptStart !== -1 && offset >= scriptStart && scriptEnd !== -1 && offset < scriptEnd) {
    lineOffset = source.slice(0, scriptStart).split('\n').length - 1
    source = source.slice(scriptStart, scriptEnd)
    offset -= scriptStart
    currentLine -= lineOffset
    isVueScript = true
  }

  const sf = ts.createSourceFile('tmp.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let functionBody: ts.Block | undefined
  let bestNode: ts.Node | undefined

  function findFunctionBody(node: ts.Node) {
    if (offset < node.pos || offset >= node.end)
      return

    if (ts.isBlock(node)) {
      const { parent } = node
      if (
        ts.isFunctionDeclaration(parent)
        || ts.isFunctionExpression(parent)
        || ts.isArrowFunction(parent)
        || ts.isMethodDeclaration(parent)
        || ts.isConstructorDeclaration(parent)
        || ts.isGetAccessorDeclaration(parent)
        || ts.isSetAccessorDeclaration(parent)
      ) {
        functionBody = node
      }
    }

    node.forEachChild(findFunctionBody)
  }
  findFunctionBody(sf)

  function visit(node: ts.Node) {
    if (offset < node.pos || offset >= node.end)
      return

    const insideFunctionBody = !functionBody || (node.pos >= functionBody.pos && node.end <= functionBody.end)
    if (
      insideFunctionBody
      && targetKinds.has(node.kind)
      && (!isVueScript || !isVueStructuralContainer(node))
    ) {
      const endLine = sf.getLineAndCharacterOfPosition(node.end).line
      if (endLine > currentLine && (!bestNode || node.end > bestNode.end))
        bestNode = node
    }

    node.forEachChild(visit)
  }
  visit(sf)

  if (!bestNode)
    return undefined

  const endLine = sf.getLineAndCharacterOfPosition(bestNode.end).line
  return lineOffset + endLine + 1
}

function isVueStructuralContainer(node: ts.Node) {
  const { parent } = node

  if (ts.isCallExpression(node) && ts.isExportAssignment(parent))
    return true

  if (!ts.isObjectLiteralExpression(node))
    return false

  if (ts.isExportAssignment(parent))
    return true

  if (ts.isCallExpression(parent) && ts.isExportAssignment(parent.parent))
    return true

  if (!ts.isPropertyAssignment(parent) || !ts.isObjectLiteralExpression(parent.parent))
    return false

  const optionsParent = parent.parent.parent
  const isVueOptionsObject = ts.isExportAssignment(optionsParent)
    || (ts.isCallExpression(optionsParent) && ts.isExportAssignment(optionsParent.parent))
  if (!isVueOptionsObject)
    return false

  const { name } = parent
  const propertyName = ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)
    ? name.text
    : undefined

  return !!propertyName && vueOptionContainerProperties.has(propertyName)
}
