const { resolve, sep } = require('path')
const { statSync, readdirSync } = require('fs')
const rdOpts = { withFileTypes: true }

exports = module.exports = dwalk

function getDirents(absPrefix, relPrefix, depth) {
  const dirents = readdirSync(absPrefix, rdOpts)
  for (let i = 0; i < dirents.length; i++) {
    const inner = dirents[i]
    inner.absolute = absPrefix + inner.name
    inner.relative = relPrefix + inner.name
    inner.depth = depth
  }
  return dirents
}

function* dwalk(dir) {
  const root = resolve(dir)
  if (!statSync(root).isDirectory()) return

  const queue = new exports.Queue()
  let dirents = getDirents(root + sep, '', 1)

  do {
    for (const file of dirents) {
      const command = yield file
      if (command === 'skip') continue
      if (command === 'skip_dir') break
      if (command === 'stop' || command === false) return

      if (file.isDirectory()) {
        const abs = file.absolute + sep
        const rel = file.relative + sep
        queue.push(getDirents(abs, rel, file.depth + 1))
      }
    }
  } while ((dirents = queue.shift()))
}

exports.cb = function dwalkCb(dir, cb) {
  const it = dwalk(dir)

  let emit
  let command
  while (!(emit = it.next(command)).done) {
    command = cb(emit.value)
  }
  return emit.value
}

exports.Queue = class Que {
  constructor() {
    this.head = this.tail = []
  }

  shift() {
    if (this.head !== this.tail) {
      const val = this.head[0]
      this.head = this.head[1]
      return val
    }
  }

  push(item) {
    if (this.head === this.tail) {
      this.head = [item, this.tail]
    } else {
      this.tail[0] = item
      this.tail = this.tail[1] = []
    }
  }
}
