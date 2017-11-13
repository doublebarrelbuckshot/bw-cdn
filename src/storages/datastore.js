'use strict'
const config = require('../../config')

// Datastorage is for data (a DB)
const Datastore = require('@google-cloud/datastore')
const ds = Datastore({
  projectId: config.get('GCLOUD_PROJECT')
})

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
function toDatastore (obj, indexedKeys) {
  console.error('indexedKeys', indexedKeys)
  indexedKeys = indexedKeys || []
  let results = []
  Object.keys(obj).forEach((k) => {
    if (obj[k] === undefined) {
      return
    }
    results.push({
      name: k,
      value: obj[k],
      excludeFromIndexes: indexedKeys.indexOf(k) === -1
    })
  })
  return results
}

// Lists all books in the Datastore sorted alphabetically by title.
// The ``limit`` argument determines the maximum amount of results to
// return per page. The ``token`` argument allows requesting additional
// pages. The callback is invoked with ``(err, books, nextPageToken)``.
function list (options, token, cb) {
  console.error('OPTIONS ARE:', options)
  const type = options.type || null
  const limit = options.limit || 10
  const filter = options.filter
  //const order = options.order || 'id'

  let q = ds.createQuery(type)
    .limit(limit)

  if (filter) {
    q = q.filter(filter.key, filter.op, filter.value)
  }
    //.order(order)

  q = q.start(token)

  ds.runQuery(q, (err, entities, nextQuery) => {
    if (err) {
      console.error('Error in listing entries')
      cb(err)
      return
    }

    const hasMore = nextQuery.moreResults !== Datastore.NO_MORE_RESULTS ? nextQuery.endCursor : false
    cb(null, entities.map(fromDatastore), hasMore)
  })
}

/**
 * Updates a record on the datastore (or creates one if no id)
 * @param id {string} id (if previous record exists)
 * @param data {Object} data to save
 * @param cb {Function} callback
 * @return {}
 */
function update (id, data, indexedKeys, cb) {
  console.error('UPDATE indexKeys ', indexedKeys)
  let key
  if (id) {
    key = ds.key([data.type, parseInt(id, 10)])
  } else {
    console.error('NO ID')
    key = ds.key(data.type)
  }

  console.error('KEY IS', key)

  const entity = {
    key: key,
    data: toDatastore(data, indexedKeys)
  }

  console.error('ENTITY IS', entity)
  ds.save(
    entity,
    (err) => {
      if (err) {
        console.error('ERROR SAVING: ', err)
      }

      data.id = entity.key.id
      cb(err, err ? null : data)
    }
  )
}

function create (data, indexKeys, cb) {
  update(null, data, indexKeys, cb)
}

function read (kind, id, cb) {
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

function _delete (kind, id, cb) {
  const key = ds.key([kind, parseInt(id, 10)])
  ds.delete(key, cb)
}

module.exports = {
  create,
  read,
  update,
  delete: _delete,
  list
}
