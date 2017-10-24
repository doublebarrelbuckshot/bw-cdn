'use strict'

const os = require('os')
const Boom = require('boom')
const express = require('express')
const debug = require('debug')('app:bootstrap')
const compression = require('compression')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const path = require('path')
const lout4express = require('lout4express')
const joi4express = require('joi4express')
const loadRoutes = require('expressjs-routes-loader')
const utilsLoadConfig = require('./utils/loadConfig')
const fileUpload = require('express-fileupload')

var cors = require('cors')

const app = express()

debug('start')

debug(`////////// Running environment set to "${process.env.NODE_ENV}" ////////////////`)

// [start] setup configuration
// accessible through req.app.get('config').get('your property')
// -----------------------------------------------------------------------------
debug('setup configuration for expressjs app')
const config = utilsLoadConfig(path.join(__dirname, 'config'), __dirname)
app.set('config', config)

// [start] setup winstons loggers
// -----------------------------------------------------------------------------
debug('setup shared winston loggers')
const winstonLogger = require('./utils/logger')(config.get('modules:winston'))

// [start] setup expressjs security
// see https://expressjs.com/en/advanced/best-practice-security.html
// -----------------------------------------------------------------------------
app.use(helmet())

// [start] setup middleware
// https://expressjs.com/en/advanced/best-practice-performance.html
// -----------------------------------------------------------------------------
debug('setup middlewares:body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

debug('setup middlewares:compression')
app.use(compression())
app.use(fileUpload())

// [start] request logger middleware
// -----------------------------------------------------------------------------
debug(`setup request logger: "${!!winstonLogger.__request}"`)
if (winstonLogger.__request) {
  app.use(winstonLogger.__request)
}

// static directory
app.use(express.static(__dirname + '/client/build'))

// [start] setup routes with joi validation
// see https://github.com/hapijs/joi
// -----------------------------------------------------------------------------
debug('setup routes')
let routes = loadRoutes([path.join(__dirname, 'src', 'routes'), 'api', 'v1'])

routes = routes.map((route) => {
  app[route.method](route.url, joi4express(route))
  return route
})

// only for testing purpose
/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  app.use('/boom', (req, res, next) => {
    throw new Error('Boom!!!')
  })
}

// [start] setup documentation with lout (hapijs)
// see https://github.com/hapijs/lout
// -----------------------------------------------------------------------------
debug('setup documentation')
app.all('/api/docs', lout4express(routes, os.hostname()))

// [start] error logger middleware
// -----------------------------------------------------------------------------
debug(`setup error logger: "${!!winstonLogger.__errors}"`)
if (winstonLogger.__errors) {
  app.use(winstonLogger.__errors)
}

// [start] setup error handler
// all error accross the application should be Boomify
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  /* istanbul ignore else */
  if (!err || !err.isBoom) {
    Boom.boomify(err, { statusCode: err.statusCode || err.status || 500 })
  }

  /* istanbul ignore else */
  if (err.isServer) {
    debug(err)
  }

  res.status(err.output.statusCode).json(err.output.payload)
})

app.use(cors())

debug('finish')
module.exports = app
