// Test cases for log insertion after multi-line expressions

// Case 1: Object literal in assignment
this.printVal = this.easingFn({
  progress,
  xxx,
})

// Case 2: Function call with multiple args
this.printVal = this.easingFn(
  progress,
  xxx,
)

// Case 3: Array literal with nested object
this.printVal = this.easingFn([
 {
   progress,
 },
  xxx,
])

// Case 4: Deeply nested object
const result = func({
  nested: {
    deep: {
      value: progress
    }
  }
})

// Case 5: Object with array property
arr.push({
  id: 1,
  data: [
    progress,
    'other'
  ]
})

// Case 6: Object inside if block
if (condition) {
  doSomething({
    key: progress
  })
}

// Instructions: Place cursor after 'progress' in any case above and use Ctrl+L
// The log should be inserted after the closing bracket/brace of the expression
