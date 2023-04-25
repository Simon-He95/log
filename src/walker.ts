import assert from 'node:assert'
/**
 * Call `cb` on each node in `ast`. If `cb` is an object, `cb.enter` is called before processing a Node's children,
 * and `cb.leave` is called after processing a Node's children.
 */
export function dashAst(ast: any, cb: any) {
  assert(ast && typeof ast === 'object' && (typeof ast.type === 'string' || typeof ast.kind === 'string' || typeof ast.kind === 'number'),
    'dash-ast: ast must be an AST node')

  if (typeof cb === 'object') {
    assert(typeof cb.enter === 'function' || typeof cb.leave === 'function',
      'dash-ast: visitor must be an object with enter/leave functions')

    walk(ast, null, cb.enter || undefined, cb.leave || undefined)
  }
  else {
    assert(cb && typeof cb === 'function',
      'dash-ast: callback must be a function')

    walk(ast, null, cb, undefined)
  }
}

function walk(node: any, parent: any, enter: any, leave: any) {
  const cont = enter !== undefined ? enter(node, parent) : undefined
  if (cont === false)
    return

  for (const k in node) {
    if (!has(node, k) || k === 'parent')
      continue
    const v = node[k]
    if (isNode(v))
      walk(v, node, enter, leave)
    else if (Array.isArray(v))
      walkArray(v, node, enter, leave)
  }

  if (leave !== undefined)
    leave(node, parent)
}

function walkArray(nodes: any, parent: any, enter: any, leave: any) {
  for (let i = 0; i < nodes.length; i++) {
    if (isNode(nodes[i]))
      walk(nodes[i], parent, enter, leave)
  }
}

function isNode(node: any) {
  return typeof node === 'object' && node && (typeof node.type === 'string' || typeof node.kind === 'string' || typeof node.kind === 'number')
}

function has(obj: any, prop: any) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}
