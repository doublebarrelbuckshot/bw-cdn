/** @module controllers/files */
'use strict'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const debug = require('debug')('src:controllers:assets')
const Promise = require('bluebird')

const dirname = path.join(__dirname, '../../data')
const storage = require('../storages/datastore')

/**
 * return all files
 * @return {Object[]}      files
 */
function _findAll () {
  const files = fs.readdirSync(dirname)
  return files
}

/**
 * entry endpoint
 * @param  {Object} req
 * @param  {Object} res
 * @return {Object}
 */
function get (req, res) {
  const result = _findAll()
  debug(`result length sent back ${result.length}`)
  res.status(200).json(result)
}

function getFile (req, res) {
  const name = req.params.name
  res.sendFile(name, {root: dirname})
}

function listFiles (req, res) {
  const prom = Promise.promisify(storage.list)
  return prom(10, req.query.pageToken)
  .then((entities, cursor) => {
    return res.json({
      items: entities,
      nextPageToken: cursor
    })
  })
  .catch((err) => {
    console.error('ERROR IN LISTFILES', err)
  })
}

module.exports = {
  get: get,
  getFile: getFile,
  listFiles: listFiles
}
