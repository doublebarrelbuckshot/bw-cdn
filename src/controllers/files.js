/** @module controllers/files */
'use strict'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const debug = require('debug')('src:controllers:assets')
const Promise = require('bluebird')

const dirname = path.join(__dirname, '../../data')
const datastore = require('../storages/datastore')
const storage = require('../storages/storage')
const indexKeys = [
  'name',
  'tags'
]

function getFile (req, res) {
  const name = req.params.name
  res.sendFile(name, {root: dirname})
}

/**
 * Saves a file to google storage and to datastore (meta data)
 * @param req {Object} request object
 * @param res {Object} response object
 * @return {Promise} Save data to datastore promise
 */
function postFile (req, res) {
  const createPromise = Promise.promisify(datastore.create)

  return storage.sendUploadToGCS(req, res)

  .then(() => {
    let data = req.body
    data.tags = data.tags ? JSON.parse(data.tags) : []

    if (req.files.file) {
      data.fileUrl = req.files.file.cloudStoragePublicUrl
    } else {
      res.send('No File')
      return
    }

    data = embellishData(req, data)
    console.error('DATA IS: ', data)
    return createPromise(data, indexKeys)
  })

  .then(savedData => {
    console.error('Saved Data id: ', savedData.id)
    res.send('File uploaded! ' + req.files.file.cloudStoragePublicUrl + '   saved dataid: ' + savedData.id)
  })

  .catch(err => {
    res.send('Error Saving: ' + err)
  })
}

/**
 * Embellish the payload to send to datastore
 * @param  {Object} Ordinary data to save
 * @return {Object} Embellished data to save
 */
function embellishData (req, data) {
  const now = new Date().getTime()

  const basic = {
    type: 'file',
    created: now,
    name: req.files.file.name
  }

  return _.assign(basic, data)
}

function listFiles (req, res) {
  const prom = Promise.promisify(datastore.list)
  const options = {
    limit: 10,
    type: 'file',
    order: 'name'
  }

  if (req.query.tags) {
    options.filter = {
      key: 'tags',
      op: '=',
      value: req.query.tags
    }
  }

  return prom(options, req.query.pageToken)
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
  getFile: getFile,
  listFiles: listFiles,
  postFile: postFile
}
