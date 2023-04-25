import * as vscode from 'vscode'
import * as ts from 'typescript'
import { dashAst } from './walker'

export function activate() {
  vscode.commands.registerTextEditorCommand('extension.log', async (textEditor) => {
    // todo: 根据选中内容当前行判断是否是存在换行定义字段，将log追加到其之后
    const doc = textEditor.document
    const editor = vscode.window.activeTextEditor!
    const selection = editor.selection as any
    const [start, end] = getPosition(doc.getText(), selection.start.c)
    // 获取全部文本区域
    const text = doc.getText(selection)
    let append = `console.log('~ logger 🤪 : ', ${text || '\'\''})\n`

    if (!text) {
      return textEditor.edit((builder) => {
        builder.insert(new vscode.Position(selection.end.line + 1, 0), append)
      })
    }
    const ast = ts.createSourceFile('test.ts', doc.getText(), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const nodes: { name: string; start: number; end: number }[] = []
    dashAst(ast, (currentNode: any) => {
      try {
        // 259 FunctionDeclaration
        if (currentNode.kind === 259) {
          const { escapedText: name } = currentNode.name
          const { end, pos: start } = currentNode
          nodes.push({
            name,
            start,
            end,
          })
        }
      }
      catch (e) {
      }
    })
    const target = nodes.find((node) => {
      const { start: node_start, end: node_end } = node
      return node_start <= start && node_end >= end
    })
    if (target)
      append = `  console.log('~ logger 🤪 ${target.name} -> ${text}: ', ${text})\n`

    textEditor.edit((builder) => {
      builder.insert(new vscode.Position(selection.end.line + 1, 0), append)
    })
  })
}

export function deactivate() {

}

// 根据行位置获取字符串位置
function getPosition(allText: string, line: number) {
  const texts = allText.split('\n')
  let startTag = 0
  for (let i = 0; i < line; i++)
    startTag += texts[i].length + (i > 0 ? 1 : 0)

  return [startTag, startTag + 1 + texts[line].length]
}
