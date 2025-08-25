import * as vscode from 'vscode'
import * as ts from 'typescript'
import { createPosition, getActiveText, getActiveTextEditor, getCopyText, useConfiguration } from "@vscode-use/utils/index"
import { dashAst } from "./walker"

// --- Utility Types ---
interface CapturedNode { name: string; start: number; end: number; type: number }

// 根据行位置获取字符串位置（保持原逻辑，如后续改用 doc APIs 可删除）
function getPosition(allText: string, line: number, offset: number) {
  const texts = allText.split('\n')
  let startTag = 0
  for (let i = 0; i < line; i++)
    startTag += texts[i].length + (i > 0 ? 1 : 0)
  return [startTag + offset + 1, startTag + 1 + texts[line].length]
}

// 根据字符串位置获取行数
function getLine(allText: string, position: number) {
  const texts = allText.split('\n')
  let start = 0
  for (let i = 0; i < texts.length; i++) {
    const offset = texts[i].length + 1
    const end = start + offset
    if (start <= position && position <= end)
      return i
    start = end
  }
}

// 获取缩进（使用 VS Code 行信息改进）
function getIndent(doc: vscode.TextDocument, line: number) {
  if (line >= doc.lineCount) return 0
  return doc.lineAt(line).firstNonWhitespaceCharacterIndex
}

function transformAppend(suffix: string, indent: number, logPrefix: string, text: string, enableColor: boolean) {
  const pad = ' '.repeat(indent)
  switch (suffix) {
    case 'go':
      return `${pad}fmt.Println("${logPrefix} : ", ${text || '""'})\n`
    case 'rs':
      return `${pad}println!("${logPrefix} : {}", ${text || '""'});\n`
    default:
      return enableColor
        ? `${pad}${logWithStyledColor(`${logPrefix} : `, `${text || '""'}`)}\n`
        : `${pad}console.log('${logPrefix} : ', ${text || '""'})\n`
  }
}

const config = useConfiguration<{ fileInfo: boolean, scoped: boolean, randomColor?: boolean, colors?: string[] }>('codeLoc.config')

export async function getLog() {
  const editor = getActiveTextEditor()
  if (!editor) return
  const selections = editor.selections
  const allText = getActiveText()!
  const doc = editor.document
  const fileName = doc.fileName.split(vscode.env.appName === 'Visual Studio Code' ? '/' : '\\').slice(-1)[0]
  const suffix = fileName.split('.').slice(-1)[0]
  const data: Array<[vscode.Position, number, number, string, string]> = []

  for (const selection of selections) {
    const [start, end] = getPosition(allText, selection.start.line, selection.start.character)
    const indent = getIndent(doc, selection.start.line)
    const selectedText = doc.getText(selection)

    if (!selectedText) {
      const copyText = await getCopyText()
      const append = copyText
        ? transformAppend(suffix, indent, `🤪 ~ file: ${fileName}:${selection.end.line + 1}`, copyText.replace(/\n/g, ', '), !!config().randomColor)
        : transformAppend(suffix, indent, `🤪 ~ file: ${fileName}:${selection.end.line + 1}`, selectedText, !!config().randomColor)
      return editor.edit(builder => {
        const targetLine = computeInsertLineIfInComment(doc, selection.end.line)
        builder.insert(createPosition(targetLine + 1, 0), append)
      })
    }

    const ast = ts.createSourceFile('tmp.ts', doc.getText(), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const nodes: CapturedNode[] = []
    dashAst(ast, (currentNode: any) => {
      try {
        if (!currentNode) return
        let { end: _end, pos: _start, kind, escapedText, parent } = currentNode
        if (kind === ts.SyntaxKind.SourceFile || !escapedText) return
        if (kind === 79) _end = parent.end
        if (_end >= end && _start <= start) {
          nodes.push({
            name: escapedText,
            start: _start,
            end: _end,
            type: parent.kind,
          })
        }
      } catch {}
    })

    let position = new vscode.Position(selection.end.line + 1, 0)
    let fileInfo = selection.end.line + 1
    const head = nodes.reduce((pre: string, cur: CapturedNode) => {
      if (!pre) return cur.name
      if (!cur) return pre
      if (cur.type === 257) {
        const endPos = cur.end
        const endLine = getLine(allText, endPos)!
        fileInfo = endLine + 1
        position = new vscode.Position(endLine + 1, 0)
      }
      return `${pre}/${cur.name}`
    }, '')
    // 注释块判断
    const adjustedLine = computeInsertLineIfInComment(doc, position.line - 1)
    position = new vscode.Position(adjustedLine + 1, 0)
    data.push([position, indent, fileInfo, head, selectedText])
  }

  editor.edit(builder => {
    data.forEach(([position, indent, fileInfo, head, text]) => {
      let logPrefix = ''
      const cfg = config()
      if (cfg.fileInfo) logPrefix += `🤪 ~ file: ${fileName}:${fileInfo} `
      if (cfg.scoped) logPrefix += `[${head}] -> `
      logPrefix += text
      builder.insert(position, transformAppend(suffix, indent, logPrefix, text, !!cfg.randomColor))
    })
  })
}

let colorIndex = 0
function pickColor() {
  const cfg = config()
  const list = cfg.colors
  if (list && list.length) {
    const c = list[colorIndex % list.length]
    colorIndex++
    return c
  }
  if (cfg.randomColor === false)
    return undefined
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0')
}

function logWithStyledColor(text: string, variable: any) {
  const c = pickColor()
  if (!c)
    return `console.log('${text}', ${variable});`
  return `console.log('%c${text}', 'color: ${c}', ${variable});`
}

// 如果当前行在多行注释块内，找到该注释块的结束行 (re-added after refactor)
function computeInsertLineIfInComment(doc: vscode.TextDocument, line: number) {
  if (line < 0 || line >= doc.lineCount) return line
  const textUp: string[] = []
  for (let i = line; i >= 0 && i > line - 100; i--) textUp.push(doc.lineAt(i).text)
  const joinedUp = textUp.reverse().join('\n')
  const openIndex = joinedUp.lastIndexOf('/*')
  const closeIndex = joinedUp.lastIndexOf('*/')
  if (openIndex !== -1 && (closeIndex === -1 || closeIndex < openIndex)) {
    for (let j = line; j < doc.lineCount && j < line + 200; j++) {
      if (doc.lineAt(j).text.includes('*/')) return j
    }
  }
  return line
}

// end
