import * as vscode from 'vscode'
import * as ts from 'typescript'
import { dashAst } from './walker'

export function activate() {
  vscode.commands.registerTextEditorCommand('extension.log', async (textEditor) => {
    // todo: 根据选中内容当前行判断是否是存在换行定义字段，将log追加到其之后
    const doc = textEditor.document
    const editor = vscode.window.activeTextEditor!
    // 获取全部文本区域
    const allText = doc.getText()
    const fileName = doc.fileName.split(vscode.env.appName === 'Visual Studio Code' ? '/' : '\\').slice(-1)[0]
    const selection = editor.selection as any
    const [start, end] = getPosition(allText, selection.start.c, selection.start.e)
    const tab = getTab(allText, selection.start.c)
    const text = doc.getText(selection)
    let append = `${' '.repeat(tab)}console.log('🤪 ~ file: ${fileName}:${selection.end.line + 1} : ', ${text || '\'\''})\n`
    if (!text) {
      return textEditor.edit((builder) => {
        builder.insert(new vscode.Position(selection.end.line + 1, 0), append)
      })
    }
    const ast = ts.createSourceFile('test.ts', doc.getText(), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const nodes: { name: string; start: number; end: number; type: number }[] = []
    dashAst(ast, (currentNode: any) => {
      try {
        // 259 FunctionDeclaration
        if (!currentNode)
          return
        let { end: _end, pos: _start, kind, escapedText, parent } = currentNode
        if (kind === ts.SyntaxKind.SourceFile || !escapedText)
          return

        if (kind === 79)
          _end = parent.end

        if (parent.kind !== 171 && parent.kind !== 259)
          return
        if (_end > end && _start < start) {
          nodes.push({
            name: escapedText,
            start: _start,
            end: _end,
            type: parent.kind,
          })
        }
      }
      catch (e) {
      }
    })
    let position = new vscode.Position(selection.end.line + 1, 0)
    let fileInfo = selection.end.line + 1
    const head = nodes.reduce((pre: any, cur: any) => {
      if (!pre)
        return cur.name
      if (!cur)
        return pre
      if (cur.type === 257) {
        const end = cur.end
        const endLine = getLine(allText, end)!
        fileInfo = endLine + 1
        position = new vscode.Position(endLine + 1, 0)
      }
      return `${pre}/${cur.name}`
    }, '')

    append = `${' '.repeat(tab)}console.log('🤪 ~ file: ${fileName}:${fileInfo} [${head}] -> ${text} : ', ${text})\n`

    textEditor.edit((builder) => {
      builder.insert(position, append)
    })
  })
}

export function deactivate() {

}

// 根据行位置获取字符串位置
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

function getTab(allText: string, line: number) {
  const texts = allText.split('\n')
  let tabCount = 0
  for (let i = 0; i < texts[line].length; i++) {
    if (texts[line][i] === ' ')
      tabCount++
    else
      return tabCount
  }
  return tabCount
}
