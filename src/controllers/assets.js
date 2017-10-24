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

function postFile (req, res) {
  const file = req.files.file
  const filepath = dirname + '/' + file.name

  file.mv(filepath, function (err) {
    if (err) {
      return res.status(500).send(err)
    }

    res.send('File uploaded!')
  })
}

/**
 * Saves a file to google storage and to datastore (meta data)
 * @param req {Object} request object
 * @param res {Object} response object
 * @return {Promise} Save data to datastore promise
 */
function postFilex (req, res) {
  const createPromise = Promise.promisify(storage.create)

  return storage.sendUploadToGCS(req, res)

  .then(() => {
    let data = req.body

    if (req.files.file) {
      data.fileUrl = req.files.file.cloudStoragePublicUrl
    } else {
      res.send('No File')
      return
    }

    return createPromise(req.body)
  })

  .then(savedData => {
    console.error('Saved Data id: ', savedData.id)
    res.send('File uploaded!' + req.files.file.cloudStoragePublicUrl + '   saved dataid: ' + savedData.id)
  })
  
  .catch(err => {
    res.send('Error Saving: ' + err)
  })
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
  listFiles: listFiles,
  postFile: postFile,
  postFilex: postFilex
}
