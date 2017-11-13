'use strict'
const Promise = require('bluebird')
const _ = require('lodash')

const config = require('../../config')
const CLOUD_BUCKET = config.get('CLOUD_BUCKET')

// Storage is for storing files
const Storage = require('@google-cloud/storage')
const storage = Storage({
  projectId: config.get('GCLOUD_PROJECT')
})

const bucket = storage.bucket(CLOUD_BUCKET)

/**
 * Uploads a file to GCS if there is a file in the body (req.files.file)
 * @param  {Object} req Request Object
 * @param  {Object} res Response Object
 * @return {Promise}     Resolve/Reject(with error)
 */
function sendUploadToGCS (req, res) {
  if (!req.files.file) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const gcsname = Date.now() + req.files.file.name
    const file = bucket.file(gcsname)

    console.error(req.files.file)
    const stream = file.createWriteStream({
      metadata: {
        contentType: req.files.file.mimetype
      }
    })

    stream.on('error', (err) => {
      req.files.file.cloudStorageError = err
      reject(err)
    })

    stream.on('finish', () => {
      req.files.file.cloudStorageObject = gcsname
      file.makePublic().then(() => {
        req.files.file.cloudStoragePublicUrl = getPublicUrl(gcsname)
        resolve()
      })
    })

    stream.end(req.files.file.data)
  })
}

/**
 * Constructs the filename for the newly uploaded file
 * @param  {String} filename Original filename
 * @return {String}          Public url of file uploaded to google storage
 */
function getPublicUrl (filename) {
  return `https://storage.googleapis.com/${CLOUD_BUCKET}/${filename}`
}

module.exports = {
  sendUploadToGCS
}
