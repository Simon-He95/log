export interface RemoveConsoleConfigInternal {
  methods: string[]
  preservePatterns: string[]
  includeTrailingNewLine: boolean
}

export interface Segment { start: number; end: number; method: string }

function isIdent(ch: string) { return /[A-Za-z0-9_$]/.test(ch) }

// Heuristic cleanup: expand segment to cover logical/comma operators that would be left dangling.
function expandForOperators(text: string, seg: Segment): Segment {
  let { start, end } = seg
  // Trim trailing whitespace first
  while (end < text.length && /[ \t]/.test(text[end])) end++
  // Include following newline if only whitespace remains on the line after deletion
  const lineEndIdx = (() => { const n = text.indexOf('\n', end); return n === -1 ? text.length : n })()
  if (/^\s*$/.test(text.slice(end, lineEndIdx))) end = lineEndIdx + 1

  // Check preceding operator
  let k = start - 1
  while (k >= 0 && /[ \t]/.test(text[k])) k--
  const maybeOp = text.slice(k - 1, k + 1)
  const singleChar = text[k]
  if (maybeOp === '&&' || maybeOp === '||') {
    start = k - 1
    // remove whitespace before operator
    while (start > 0 && /[ \t]/.test(text[start - 1])) start--
  }
  else if (singleChar === ',' ) {
    start = k
    while (start > 0 && /[ \t]/.test(text[start - 1])) start--
  }
  return { ...seg, start, end }
}

export function computeConsoleSegments(text: string, cfg: RemoveConsoleConfigInternal): Segment[] {
  const segments: Segment[] = []
  const len = text.length
  let i = 0
  let state: 'code' | 's' | 'd' | 't' | 'regex' | 'sl_comment' | 'ml_comment' = 'code'
  let templateDepth = 0
  const methods = new Set(cfg.methods || ['log'])
  const preserve = (cfg.preservePatterns || []).filter(Boolean)

  function shouldPreserve(argsSlice: string) {
    return preserve.some(p => p && argsSlice.includes(p))
  }

  while (i < len) {
    const ch = text[i]
    const duo = text.slice(i, i + 2)
    if (state === 'code') {
      if (duo === '//') { state = 'sl_comment'; i += 2; continue }
      if (duo === '/*') { state = 'ml_comment'; i += 2; continue }
      if (ch === '\'') { state = 's'; i++; continue }
      if (ch === '"') { state = 'd'; i++; continue }
      if (ch === '`') { state = 't'; i++; continue }
      if (ch === '/' && /[\(=:\[,!&|?{};\n]/.test(text[i - 1] || '\n')) { state = 'regex'; i++; continue }

      if (ch === 'c' && text.startsWith('console', i)) {
        const before = text[i - 1]
        if (before && isIdent(before)) { /* part of identifier */ }
        else {
          let j = i + 'console'.length
          // optional chaining or property access
          let bracketMethod: string | null = null
          let consumedBracket = false
          if (text[j] === '?' && text[j + 1] === '.') j += 2
          if (text[j] === '.') j++
          if (text[j] === '[') {
            const close = text.indexOf(']', j + 1)
            if (close !== -1) {
              const rawInside = text.slice(j + 1, close).trim()
              const m = rawInside.match(/^['"`](.*)['"`]$/)
              if (m) {
                bracketMethod = m[1]
                consumedBracket = true
                j = close + 1
              }
              else {
                // dynamic expr, skip
              }
            }
          }
          const methodMatch = text.slice(j).match(/^[A-Za-z0-9_$]+/)
          let method = methodMatch ? methodMatch[0] : ''
          if (!method && bracketMethod) method = bracketMethod
          if (!method) { i++; continue }
          if (!methods.has(method)) { i++; continue }
          if (!consumedBracket) j += method.length
          while (j < len && /\s/.test(text[j])) j++
          if (text[j] !== '(') { i++; continue }
          j++
          let depth = 1
          let inner: 'code' | 's' | 'd' | 't' | 'regex' = 'code'
          const argsStart = j
          while (j < len && depth > 0) {
            const c2 = text[j]
            if (inner === 'code') {
              if (c2 === '\\') { j += 2; continue }
              if (c2 === '\'') { inner = 's'; j++; continue }
              if (c2 === '"') { inner = 'd'; j++; continue }
              if (c2 === '`') { inner = 't'; j++; continue }
              if (c2 === '(') { depth++; j++; continue }
              if (c2 === ')') { depth--; j++; continue }
              if (c2 === '/' && /[\(=:\[,!&|?{};\n]/.test(text[j - 1] || '\n')) { inner = 'regex'; j++; continue }
              j++
            }
            else if (inner === 's') {
              if (c2 === '\\') { j += 2; continue }
              if (c2 === '\'') { inner = 'code'; j++; continue }
              j++
            }
            else if (inner === 'd') {
              if (c2 === '\\') { j += 2; continue }
              if (c2 === '"') { inner = 'code'; j++; continue }
              j++
            }
            else if (inner === 't') {
              if (c2 === '\\') { j += 2; continue }
              if (c2 === '`') { inner = 'code'; j++; continue }
              if (c2 === '$' && text[j + 1] === '{') { j += 2; continue }
              j++
            }
            else if (inner === 'regex') {
              if (c2 === '\\') { j += 2; continue }
              if (c2 === '/') { inner = 'code'; j++; continue }
              j++
            }
          }
          if (depth === 0) {
            const argsSlice = text.slice(argsStart, j - 1)
            if (shouldPreserve(argsSlice)) { i = j; continue }
            // trailing whitespace & semicolon
            while (j < len && /\s/.test(text[j])) j++
            if (text[j] === ';') j++
            // optional newline removal decided later by expand
            const lineStart = (() => { let k2 = i; while (k2 > 0 && text[k2 - 1] !== '\n') k2--; return k2 })()
            const onlyWsBefore = text.slice(lineStart, i).trim().length === 0
            const rawSeg: Segment = { start: onlyWsBefore ? lineStart : i, end: j, method }
            const expanded = expandForOperators(text, rawSeg)
            segments.push(expanded)
            i = expanded.end
            continue
          }
        }
      }
      i++
      continue
    }
    if (state === 's') {
      if (ch === '\\') { i += 2; continue }
      if (ch === '\'') { state = 'code'; i++; continue }
      i++; continue
    }
    if (state === 'd') {
      if (ch === '\\') { i += 2; continue }
      if (ch === '"') { state = 'code'; i++; continue }
      i++; continue
    }
    if (state === 't') {
      if (ch === '\\') { i += 2; continue }
      if (ch === '`') { state = 'code'; i++; continue }
      if (ch === '$' && text[i + 1] === '{') { templateDepth++; i += 2; continue }
      if (ch === '}' && templateDepth > 0) { templateDepth--; i++; continue }
      i++; continue
    }
    if (state === 'regex') {
      if (ch === '\\') { i += 2; continue }
      if (ch === '/') { state = 'code'; i++; continue }
      i++; continue
    }
    if (state === 'sl_comment') { if (ch === '\n') { state = 'code'; i++; continue } i++; continue }
    if (state === 'ml_comment') { if (duo === '*/') { state = 'code'; i += 2; continue } i++; continue }
  }
  // Merge overlapping segments (just in case)
  if (segments.length > 1) {
    segments.sort((a,b)=> a.start - b.start)
    const merged: Segment[] = []
    for (const s of segments) {
      const last = merged[merged.length - 1]
      if (last && s.start <= last.end) last.end = Math.max(last.end, s.end)
      else merged.push({...s})
    }
    return merged
  }
  return segments
}
