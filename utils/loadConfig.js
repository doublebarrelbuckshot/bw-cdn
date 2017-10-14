'use strict'

const nconf = require('nconf')
const debug = require('debug')('app:config')
const fs = require('fs')

/**
 * Load and return app configuration
 *
 * @param  {String} dir           directory to be read
 * @param  {String} projectRoot   project root directory
 *
 * @return {Object} nconf configuration
 */
function loadConfig (dir, projectRoot) {
  debug('[start] loading/preparing global configuration.')

  // 1. any overrides
  nconf.overrides({
    projectRoot: projectRoot
  })

  // setup nconf to use (in-order):
  //   2. command-line arguments
  //   3. environment variables
  // nconf.argv()
  //      .env(['NODE_ENV', 'PORT'])

  // 4. load all configuration files
  debug('load all configuration files')
  const files = getFilesFromDir(dir)
  const contents = getFilesContent(files)

  contents.forEach(content => {
    nconf.use(content.name, { type: 'literal', store: content })
  })

  // 5. Any default values
  // defaults === nothing have been set - use this
  const defaults = _loadDefaultConfiguration(dir)
  nconf.defaults(defaults)

  nconf.load()

  debug('[end] loading global configuration.')

  return nconf
}

/**
 * Return all file name from a specific folder
 *
 * @param  {String} dir   directory to be read
 *
 * @return {Array}        all files that match the current env
 */
function getFilesFromDir (dir) {
  let files

  try {
    files = fs.readdirSync(dir)
  } catch (e) {
    throw Error(`no directory found ${dir}`)
  }

  files = filterFilesByEnv(dir, files)
  debug('files to be load by the application: ', files)

  return files
}

/**
 * Retrun filtering array of file name for a specific environment
 *
 * @param  {String} dir   directory to be read
 * @param  {Array} files  all file name to be loaded to be filtered
 *
 * @return {Array}        array with filtering files path
 */
function filterFilesByEnv (dir, files) {
  return files.filter(file => (file.indexOf(process.env.NODE_ENV) > -1))
               .map(fileName => `${dir}/${fileName}`)
}

/**
 * Return an array of object containing all configuration
 *
 * @param  {Array} files   all file name to be loaded
 *
 * @return {Array}
 */
function getFilesContent (files) {
  return files.map((file) => {
    const content = fs.readFileSync(file)

    return JSON.parse(content)
  })
}

/**
 * return default settings after loading default file
 * and default app
 *
 * @param  {String} dir           directory to be read
 *
 * @return {Object}               default settings configuration
 */
function _loadDefaultConfiguration (dir) {
  const defaultFile = `${dir}/default.tpl.json`
  let settings = {}

  /* istanbul ignore else */
  if (fs.lstatSync(defaultFile).isFile()) {
    settings = fs.readFileSync(defaultFile)
    settings = JSON.parse(settings)
  }

  debug(`default settings: \n ${JSON.stringify(settings, null, 2)}`)

  return Object.assign({}, settings)
}

module.exports = loadConfig
