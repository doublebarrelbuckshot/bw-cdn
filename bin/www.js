'use strict'

const debug = require('debug')('app:createServer')
const http = require('http')
const app = require('../app')
debug('start')

// [start] setup port
// -----------------------------------------------------------------------------
const port = normalizePort(process.env.PORT || 2999)
app.set('port', port)

// [start] create HTTP server
// -----------------------------------------------------------------------------
const server = http.createServer(app)

// [start] listen on provided port, on all network interfaces
// -----------------------------------------------------------------------------
process.env.PORT || port
server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 *
 * @param  {int} val    port number
 *
 * @return {Number|String|Boolean}
 */
function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      debug(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      debug(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`
  debug(`listening on ${bind}`)
  debug('finish')
}

/**
 * Enabling Graceful Shutdown
 * https://hub.docker.com/r/keymetrics/pm2/
 */
process.on('SIGINT', () => {
  process.exit(1)
})
module.exports = server
