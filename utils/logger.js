'use strict'

const winston = require('winston')
const expressWinston = require('express-winston')

/**
 * [reminder] by default levels are set like this
 * {
 *   error: 0,
 *   warn: 1,
 *   info: 2,
 *   verbose: 3,
 *   debug: 4,
 *   silly: 5
 * }
 *
 * transport documentation: https://github.com/winstonjs/winston/blob/master/docs/transports.md
 *
 * this wrapper try to make winston easier to configure shared logger
 * through the application.
 * It's driven by the configuration file
 *
 * You can use logger like this in your application
 *
 * const winston = require('winston')
 * const category1 = winston.loggers.get('category1')
 * const category2 = winston.loggers.get('category2')
 *
 * category1.info('hello')
 * category2.info('hello')
 */

// 1. remove default console set by winston
winston.remove(winston.transports.Console)

/**
 * should be import and execute in your main
 * entry point ("app.js") to configure all loggers
 * @param  {Object.<transports: Object, loggers: Object>} options
 * @return {null|Object<__request: Object, __errors: Object>}  could return predefined
 *                                                             expressjs logger to be
 *                                                             use as middleware
 */
function createLoggers (options) {
  // 1. build all loggers options
  const loggers = _buildLoggersOptions(options)

  // 2. filters loggers
  const filterLoggers = _filterLoggers(loggers)

  // 3. create shared loggers
  filterLoggers.shared.forEach(logger => _createSharedLogger(logger))

  // 4. create express logger
  const expressLogger = filterLoggers.express.reduce((acc, logger) => {
    acc[logger.name] = _createExpressWinstonLogger(logger)

    return acc
  }, {})

  return expressLogger
}

/**
 * return an array of logger with their full configuration
 * (merge default transport options with the one define
 * in the logger)
 * @param  {Object.<transports: Object, loggers: Object>} options
 * @return {Array.<Object>}
 */
function _buildLoggersOptions (options) {
  return options.loggers.reduce((acc, logger) => {
    const transports = _buildLoggerTransports(logger, options.transports)

    // no transport defined, we don't regiter anything
    if (Object.keys(transports).length > 0) {
      logger.transports = transports
      delete logger.options
      acc.push(logger)
    }

    return acc
  }, [])
}

/**
 * return all transports for a specific logger
 * @param  {Array.<string>} logger      logger configuration
 * @param  {Object} transports  default transports defined
 * @return {Oject}
 */
function _buildLoggerTransports (logger, transports) {
  const wantedTransports = logger.transports

  return Object.keys(transports)

  .filter(key => wantedTransports.indexOf(key) > -1)

  .reduce((acc, key) => {
    acc[key] = Object.assign({}, transports[key], logger.options)

    return acc
  }, {})
}

/**
 * return loggers filtered by
 *   - the one shared in the application (user defined)
 *   - the ones created by module express-winston (middleware)
 * @param  {Object[]} loggers                           all loggers defined in the configuration
 * @return {Object.<shared: Object, express: Object>}   filtered list of loggers
 */
function _filterLoggers (loggers) {
  return loggers.reduce((acc, logger) => {
    const res = logger.name.indexOf('__') > -1

    if (res) {
      acc.express.push(logger)
    } else {
      acc.shared.push(logger)
    }

    return acc
  }, { shared: [], express: [] })
}

/**
 * create user defined shared logger for the application
 * @param  {Object} logger  options defined for the logger
 */
function _createSharedLogger (logger) {
  const name = logger.name

  winston.loggers.add(name, logger.transports)
}

/**
 * create specific logger from express-winston lib
 * @param  {Object} logger  options defined for the logger
 * @return {Object}         logger instance
 */
function _createExpressWinstonLogger (logger) {
  const transports = _instantiateTransportsLogger(logger)

  if (logger.name === '__request') {
    return _setupRequestLogger(transports)
  } else if (logger.name === '__errors') {
    return _setupErrorsLogger(transports)
  } else {
    throw Error(`not supported express logger "${logger.name}`)
  }
}

/**
 * return instantiated transports needed for a logger
 * @param  {Object} logger  options defined for the logger
 * @return {Array}
 */
function _instantiateTransportsLogger (logger) {
  return Object.keys(logger.transports)

    .map(key => {
      const options = logger.transports[key]

      switch (key) {
        case 'console':
          return new winston.transports.Console(options)
        case 'file':
          return new winston.transports.File(options)
        default:
          throw Error(`not supported transport "${key}"`)
      }
    })
}

/**
 * setup expressjs request logger
 * @param  {Object} logger  options defined for the logger
 * @return {Object}         logger instance
 */
function _setupRequestLogger (transports) {
  const defaultOpts = {
    transports: transports,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: true,
    ignoreRoute: function (req, res) { return false }
  }

  return expressWinston.logger(defaultOpts)
}

/**
 * setup expressjs errors logger
 * @param  {Object} logger  options defined for the logger
 * @return {Object}         logger instance
 */
function _setupErrorsLogger (transports) {
  const defaultOpts = {
    transports: transports
  }

  return expressWinston.errorLogger(defaultOpts)
}

module.exports = createLoggers
