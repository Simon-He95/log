import { describe, it, expect } from 'vitest'
import { computeInsertionLine } from '../src/insertion'

function runCase(source: string, marker: string) {
  const offset = source.indexOf(marker)
  if (offset === -1) throw new Error('marker not found')
  const currentLine = source.slice(0, offset).split('\n').length - 1
  return computeInsertionLine({ source, offset, currentLine })
}

function runCaseAtEnd(source: string, marker: string) {
  const offset = source.indexOf(marker) + marker.length
  if (offset < marker.length) throw new Error('marker not found')
  const currentLine = source.slice(0, offset).split('\n').length - 1
  return computeInsertionLine({ source, offset, currentLine })
}

const sample1 = `this.printVal = this.easingFn({\n  progress,\n  xxx,\n})\n` // want line after closing }
const sample2 = `this.printVal = this.easingFn(\n  progress,\n  xxx,\n)\nnext()`
const sample3 = `this.printVal = this.easingFn([\n {\n   progress,\n },\n  xxx,\n])\n`

// More complex nested cases
const sample4 = `const result = func({\n  nested: {\n    deep: {\n      value: progress\n    }\n  }\n})\n`
const sample5 = `arr.push({\n  id: 1,\n  data: [\n    progress,\n    'other'\n  ]\n})\n`
const sample6 = `if (condition) {\n  doSomething({\n    key: progress\n  })\n}\n`

// marker choose 'progress'

describe('computeInsertionLine', () => {
  it('object literal call', () => {
    const line = runCase(sample1, 'progress')
    // closing brace line index = 3 (0-based), expect insertion line = 4
    expect(line).toBe(4)
  })
  it('paren call', () => {
    const line = runCase(sample2, 'progress')
    // ) line is 3 -> insertion line 4
    expect(line).toBe(4)
  })
  it('array literal call', () => {
    const line = runCase(sample3, 'progress')
    // sample3 lines: 0:this.printVal = this.easingFn([, 1: {, 2:   progress,, 3: },, 4:  xxx,, 5:]), 6:
    // ] closes at line 5, so insertion should be line 6
    expect(line).toBe(6)
  })
  it('deeply nested object', () => {
    const line = runCase(sample4, 'progress')
    // Should insert after outermost closing }
    expect(line).toBe(7)
  })
  it('object with array property', () => {
    const line = runCase(sample5, 'progress')
    // Should insert after outermost closing }
    expect(line).toBe(7)
  })
  it('object inside if block', () => {
    const line = runCase(sample6, 'progress')
    // Should insert after object closing }, not after if block
    expect(line).toBe(4)
  })

  it('does not insert after whole Vue option arrow function body', () => {
    const source = `<script>
export default {
  mounted: () => {
    const foo = 1
  },
}
</script>`

    expect(runCaseAtEnd(source, 'foo')).toBeUndefined()
  })

  it('still inserts after multiline expression inside Vue option method', () => {
    const source = `<script>
export default {
  methods: {
    test() {
      const result = api({
        id: 1,
      })
    },
  },
}
</script>`
    const line = runCaseAtEnd(source, 'id')
    const scriptEndLine = source.split('\n').findIndex(line => line.includes('</script>'))

    // api(...) closes on line 6 (0-based), so insert on the next line.
    expect(line).toBe(7)
    expect(line).toBeLessThan(scriptEndLine)
  })
})
