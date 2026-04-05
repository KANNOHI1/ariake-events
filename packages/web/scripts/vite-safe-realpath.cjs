const childProcess = require('node:child_process')
const { EventEmitter } = require('node:events')

const originalExec = childProcess.exec

childProcess.exec = function patchedExec(command, options, callback) {
  let resolvedOptions = options
  let resolvedCallback = callback

  if (typeof resolvedOptions === 'function') {
    resolvedCallback = resolvedOptions
    resolvedOptions = undefined
  }

  if (typeof command === 'string' && command.trim().toLowerCase() === 'net use') {
    const child = new EventEmitter()
    child.stdout = null
    child.stderr = null
    child.stdin = null
    child.kill = () => true
    child.pid = 0

    process.nextTick(() => {
      if (resolvedCallback) {
        resolvedCallback(null, '', '')
      }
      child.emit('exit', 0, null)
      child.emit('close', 0, null)
    })

    return child
  }

  return originalExec.call(this, command, resolvedOptions, resolvedCallback)
}
