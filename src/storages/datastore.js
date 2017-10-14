// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict'
const Promise = require('bluebird')
const config = require('../../config')
const CLOUD_BUCKET = config.get('CLOUD_BUCKET')

// Datastorage is for data (a DB)
const Datastore = require('@google-cloud/datastore')
const ds = Datastore({
  projectId: config.get('GCLOUD_PROJECT')
})

// Storage is for storing files
const Storage = require('@google-cloud/storage')
const storage = Storage({
  projectId: config.get('GCLOUD_PROJECT')
})

const bucket = storage.bucket(CLOUD_BUCKET)

const kind = 'File'

/**
 * Uploads a file to GCS if there is a file in the body (req.files.file)
 * @param  {Object} req Request Object
 * @param  {Object} res Response Object
 * @return {Promise}     Resolve/Reject(with error)
 */
function sendUploadToGCS (req, res) {
  console.error('inside senduploadtogcs')
  if (!req.files.file) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const gcsname = Date.now() + req.files.file.name
    const file = bucket.file(gcsname)

    console.error('printing req.files.file')
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

// Translates from Datastore's entity format to
// the format expected by the application.
//
// Datastore format:
//   {
//     key: [kind, id],
//     data: {
//       property: value
//     }
//   }
//
// Application format:
//   {
//     id: id,
//     property: value
//   }
function fromDatastore (obj) {
  obj.id = obj[Datastore.KEY].id
  return obj
}

// Translates from the application's format to the datastore's
// extended entity property format. It also handles marking any
// specified properties as non-indexed. Does not translate the key.
//
// Application format:
//   {
//     id: id,
//     property: value,
//     unindexedProperty: value
//   }
//
// Datastore extended format:
//   [
//     {
//       name: property,
//       value: value
//     },
//     {
//       name: unindexedProperty,
//       value: value,
//       excludeFromIndexes: true
//     }
//   ]
function toDatastore (obj, nonIndexed) {
  nonIndexed = nonIndexed || []
  let results = []
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined) {
      return
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: nonIndexed.indexOf(k) !== -1
    })
  })
  return results
}

// Lists all books in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, books, nextPageToken)``.
function list (limit, token, cb) {
  const q = ds.createQuery()
    .limit(limit)
    //.order('title')
    //.start(token)

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      cb(err)
      return
    }
    const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false;
    cb(null, entities.map(fromDatastore), hasMore)
  })
}

// Creates a new book or updates an existing book with new data. The provided
// data is automatically translated into Datastore format. The book will be
// queued for background processing.
function update (id, data, cb) {
  let key
  if (id) {
    key = ds.key([kind, parseInt(id, 10)])
  } else {
    console.error('NO ID')
    key = ds.key(kind)
  }

  console.error('KEY IS', key)

  const entity = {
    key: key,
    data: toDatastore(data, ['description'])
  }

  console.error('ENTITY IS', entity)
  ds.save(
    entity,
    (err) => {
      console.error('ERROR SAVING: ', err)
      data.id = entity.key.id
      cb(err, err ? null : data)
    }
  )
}

function create (data, cb) {
  update(null, data, cb)
}

function read (id, cb) {
  const key = ds.key([kind, parseInt(id, 10)])
  ds.get(key, (err, entity) => {
    if (!err && !entity) {
      err = {
        code: 404,
        message: 'Not found'
      }
    }
    if (err) {
      cb(err)
      return
    }
    cb(null, fromDatastore(entity))
  })
}

function _delete (id, cb) {
  const key = ds.key([kind, parseInt(id, 10)])
  ds.delete(key, cb)
}

module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list,
  sendUploadToGCS
}
