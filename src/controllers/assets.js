/** @module controllers/files */
'use strict'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const debug = require('debug')('src:controllers:assets')

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
  console.error('HERE')
  const name = req.params.name
  console.error('dirnameis************************************************', dirname)
  res.sendFile(name, {root: dirname})
  console.error('----------------------------------------')
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

function postFilex (req, res) {
  storage.sendUploadToGCS(req, res)
  .then(() => {
    console.error('BODY IS***********')
    let data = req.body

    if (req.files.file) {
      data.fileUrl = req.files.file.cloudStoragePublicUrl
    } else {
      res.send('No File')
      return
    }

    console.error('BEFORE CREATE')

    storage.create(req.body, (err, savedData) => {
      console.error('AFTER CREATE')
      if (err) {
        res.send('Error Saving: ' + err)
      } else {
        console.error('Saved Data id: ', savedData.id)
        res.send('File uploaded!' + req.files.file.cloudStoragePublicUrl + '   saved dataid: ' + savedData.id)
      }
    })
  })
}

function listFiles (req, res) {
  storage.list(10, req.query.pageToken, (err, entities, cursor) => {
    if (err) {
      console.error('*********************************ERROR IN LISTFILES', err)
    }
    res.json({
      items: entities,
      nextPageToken: cursor
    })
  })
}

module.exports = {
  get: get,
  getFile: getFile,
  listFiles: listFiles,
  postFile: postFile,
  postFilex: postFilex
}
