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

export function computeInsertionLine(ctx: InsertionContext): number | undefined {
  const sf = ts.createSourceFile('tmp.ts', ctx.source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  let bestNode: ts.Node | undefined

  function visit(node: ts.Node) {
    // Check if offset is within this node
    if (ctx.offset >= node.pos && ctx.offset < node.end) {
      // If this is a target kind and spans multiple lines beyond current
      if (targetKinds.has(node.kind)) {
        const endLine = getLineFromPosition(ctx.source, node.end)
        if (endLine > ctx.currentLine) {
          // Choose the outermost enclosing node that ends latest
          if (!bestNode || node.end > bestNode.end) {
            bestNode = node
          }
        }
      }
      // Continue visiting children
      node.forEachChild(visit)
    }
  }
  visit(sf)

  if (!bestNode) return undefined
  
  const endLine = getLineFromPosition(ctx.source, bestNode.end)
  return endLine + 1
}

// More accurate line calculation from position
function getLineFromPosition(text: string, position: number): number {
  const beforePos = text.slice(0, position)
  return beforePos.split('\n').length - 1
}
