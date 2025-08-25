import * as vscode from 'vscode'
import { getActiveTextEditor, useConfiguration } from '@vscode-use/utils'
import { computeConsoleSegments, RemoveConsoleConfigInternal } from './removeUtil'

const removeConfig = useConfiguration<RemoveConsoleConfigInternal>('log.removeConsole')
const workspaceConfig = useConfiguration<{ includeGlobs: string[]; excludeGlobs: string[]; confirm: boolean }>('log.removeConsole.workspace')

export async function removeConsoleLogs() {
  const editor = getActiveTextEditor()
  if (!editor) return
  const doc = editor.document
  const text = doc.getText()
  const cfg = removeConfig()
  const segments = computeConsoleSegments(text, cfg)
  if (!segments.length) return
  await editor.edit(builder => {
    segments.sort((a,b)=> b.start - a.start).forEach(seg => {
      builder.delete(new vscode.Range(doc.positionAt(seg.start), doc.positionAt(seg.end)))
    })
  })
  vscode.window.setStatusBarMessage(`Removed ${segments.length} console statements`, 3000)
}

export async function previewRemoveConsoleLogs() {
  const editor = getActiveTextEditor()
  if (!editor) return
  const doc = editor.document
  const text = doc.getText()
  const cfg = removeConfig()
  const segments = computeConsoleSegments(text, cfg)
  if (!segments.length) {
    vscode.window.showInformationMessage('No console statements detected.')
    return
  }
  // Decorate ranges
  const decorations: vscode.DecorationOptions[] = segments.map(seg => ({
    range: new vscode.Range(doc.positionAt(seg.start), doc.positionAt(seg.end)),
  }))
  const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.wordHighlightStrongBackground'),
    isWholeLine: false,
    outline: '1px solid rgba(255,0,0,0.4)'
  })
  editor.setDecorations(decorationType, decorations)
  vscode.window.showInformationMessage(`Previewing ${segments.length} console statements. Run removal command to apply.`)
  // Auto clear after 5s
  setTimeout(()=> decorationType.dispose(), 5000)
}

export async function removeConsoleLogsWorkspace() {
  const cfgRemove = removeConfig()
  const cfgWs = workspaceConfig()
  const folders = vscode.workspace.workspaceFolders
  if (!folders || !folders.length) return
  const include = cfgWs.includeGlobs?.length ? cfgWs.includeGlobs : ['**/*.{js,jsx,ts,tsx}']
  const exclude = cfgWs.excludeGlobs?.length ? cfgWs.excludeGlobs : ['**/node_modules/**','**/dist/**']

  if (cfgWs.confirm) {
    const ans = await vscode.window.showWarningMessage('Remove console statements in workspace?', { modal: true }, 'Yes')
    if (ans !== 'Yes') return
  }

  // Dry-run or execute?
  const mode = await vscode.window.showQuickPick(['Execute removal','Dry run (count only)'], { placeHolder: 'Select workspace console removal mode' })
  if (!mode) return
  const dryRun = mode.startsWith('Dry run')

  await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: dryRun ? 'Analyzing console statements...' : 'Removing console statements...' }, async progress => {
    let totalFiles = 0
    let totalRemoved = 0
    const collected: Set<string> = new Set()
    // Collect & dedupe
    for (const pattern of include) {
      const uris = await vscode.workspace.findFiles(pattern, exclude.join(','))
      uris.forEach(u => collected.add(u.toString()))
    }
    const allUris = Array.from(collected).map(s => vscode.Uri.parse(s))
    const concurrency = 10
    let index = 0
    async function worker() {
      while (index < allUris.length) {
        const current = allUris[index++]
        const doc = await vscode.workspace.openTextDocument(current)
        const text = doc.getText()
        const segments = computeConsoleSegments(text, cfgRemove)
        if (!segments.length) continue
        totalFiles++
        totalRemoved += segments.length
        if (!dryRun) {
          const edit = new vscode.WorkspaceEdit()
            segments.sort((a,b)=> b.start - a.start).forEach(seg => {
              edit.delete(current, new vscode.Range(doc.positionAt(seg.start), doc.positionAt(seg.end)))
            })
          await vscode.workspace.applyEdit(edit)
          await doc.save()
        }
      }
    }
    const workers = Array.from({ length: Math.min(concurrency, allUris.length) }, () => worker())
    await Promise.all(workers)
    progress.report({ message: `${dryRun ? 'Analyzed' : 'Removed'} - Files: ${totalFiles}, Console statements: ${totalRemoved}` })
    vscode.window.showInformationMessage(`${dryRun ? 'Dry run complete.' : 'Workspace removal complete.'} Files affected: ${totalFiles}, console statements ${dryRun ? 'found' : 'removed'}: ${totalRemoved}`)
  })
}
