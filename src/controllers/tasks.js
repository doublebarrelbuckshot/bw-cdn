/** @module controllers/files */
'use strict'
const _ = require('lodash')
const debug = require('debug')('src:controllers:assets')
const Promise = require('bluebird')
const task = require('../modules/task')

const datastore = require('../storages/datastore')
const Boom = require('boom')
const indexKeys = [
  'name'
]

const parse = require('csv-parse/lib/sync')
const md5 = require('md5')
const listProm = Promise.promisify(datastore.list)
const createPromise = Promise.promisify(datastore.create)
const updatePromise = Promise.promisify(datastore.update)

const taskIndexes = [
  'name',
  'hash',
  'type'
]

const positionIndexes = [
  'positionNumber',
  'taskId',
  'type'
]

/**
 * entry endpoint
 * @param  {Object} req
 * @param  {Object} res
 * @return {Object}
 */
function postTask (req, res) {
  const csv = req.files.file.data

  const options = {
    auto_parse_date: true
  }

  const records = parse(csv, options)
  let currentTask = null
  const reg = /^[A-Za-z]{2}[0-9]{6}$/
  const tasks = records.reduce((prev, next) => {
    const positionNumber = next[1]
    const isHeader = positionNumber.match(reg) === null

    if (isHeader) {
      const task = createTask(next)

      if (prev.hasOwnProperty([task.name])) {
        throw new Error(`Task: ${task.name} already exists`)
      }

      currentTask = task
      prev[task.name] = task
    } else {
      if (currentTask) {
        const position = processPosition(next, currentTask.hash)
        prev[currentTask.name].positions.push(position)

        processInterval(currentTask, position.start, position.end)

        currentTask.mainStart = currentTask.mainStart
          ? Math.min(currentTask.mainStart, position.start)
          : position.start

        currentTask.mainEnd = currentTask.mainEnd
          ? Math.max(currentTask.mainEnd, position.end)
          : position.end
      } else {
        throw new Error(`No current task exists to push task: ${JSON.stringify(next)}`)
      }
    }

    return prev
  }, {})

  return saveTasks(tasks)

  .then(() => savePositions(tasks))

  .then(() => res.status(200).json(tasks))

  .catch((error) => res.status(500).json(error))
}

function createTask (row) {
  return {
    name: row[0],
    positions: [],
    hash: md5(row[0]),
    mainStart: null,
    mainEnd: null,
    description: row[1] || 'No description',
    created: new Date().getTime(),
    type: 'task',
    intervals: []
  }
}

function processPosition (row, taskId) {
  return {
    name: row[0],
    positionNumber: row[1],
    lowRank: row[2],
    highRank: row[3],
    memberServiceNumber: row[5] || 'Not Filled',
    memberName: row[6] || 'Not Filled',
    memberUnit: row[7] || 'Not Filled',
    end: new Date(row[10]).getTime(),
    start: new Date(row[11]).getTime(),
    role: row[27],
    taskId: taskId,
    created: new Date().getTime(),
    type: 'position'
  }
}

function processInterval (task, start, end) {
  const intervalKey = `${start}-${end}`

  if (task.intervals.indexOf(intervalKey) === -1) {
    task.intervals.push(intervalKey)
  }
}

function saveTasks (tasks) {
  const options = {
    limit: 1000,
    type: 'task',
    order: 'name'
  }

  // get tasks from DB so later we can tell if we're updating
  // or creating a new one
  return listProm(options, null)

  .then((items, cursor) => {
    const hashDict = items.reduce((prev, next) => {
      if (next.hash && !prev.hasOwnProperty(next.hash)) {
        prev[next.hash] = next
      }

      return prev
    }, {})

    return Promise.resolve(hashDict)
  })

  .then((hashes) => {
    const keys = Object.keys(tasks)

    return Promise.map(keys, (taskName) => {
      const task = tasks[taskName]
      const clone = _.cloneDeep(task)

      delete clone.positions

      // if hashes already has the same hash, then this is an update
      if (hashes.hasOwnProperty(clone.hash) && hashes[clone.hash].id) {
        return updatePromise(hashes[clone.hash].id, clone, taskIndexes)
      // else, this is a new task
      } else {
        return createPromise(clone, taskIndexes)
      }
    })
  })
}

function savePositions (tasks) {
  const options = {
    limit: 1000,
    type: 'position',
    order: 'name'
  }

  // get tasks from DB so later we can tell if we're updating
  // or creating a new one
  return listProm(options, null)

  .then((items, cursor) => {
    const positionDict = items.reduce((prev, next) => {
      if (next.positionNumber && !prev.hasOwnProperty(next.positionNumber)) {
        prev[next.positionNumber] = next
      }

      return prev
    }, {})

    return Promise.resolve(positionDict)
  })

  .then((positionsDict) => {
    const keys = Object.keys(tasks)

    const positions = keys.reduce((acc, key) => {
      acc = _.concat(acc, tasks[key].positions)

      return acc
    }, [])

    return Promise.map(positions, (position) => {
      // if hashes already has the same hash, then this is an update
      if (positionsDict.hasOwnProperty(position.positionNumber) && positionsDict[position.positionNumber].id) {
        return updatePromise(positionsDict[position.positionNumber].id, position, positionIndexes)
      // else, this is a new task
      } else {
        return createPromise(position, positionIndexes)
      }
    })
  })
}
/**
 * Get a task by name
 * @param  {Object} req request object
 * @param  {Object} res response object
 * @return {Object} file meta
 */
function getTask (req, res) {
  const readPromise = Promise.promisify(datastore.read)
  const listProm = Promise.promisify(datastore.list)

  const name = req.params.name
  const options = {
    limit: 10,
    type: 'task',
    order: 'name',
    filter: {
      key: 'name',
      op: '=',
      value: name
    }
  }

  return listProm(options, req.query.pageToken)
  .then((items, cursor) => {
    if (items.length >= 1) {
      const sorted = items.sort(compare)
      const id = sorted[0].id

      return readPromise('task', id)
    } else {
      throw('No items found for item named: ' + name)
    }
  })
  .then((response) => {
    console.error('Datastore Entry is: ', response)
    res.send(response)
  })
  .catch(err => {
    console.error('Error in getting list of all tasks: ', err)

    res.status(404).send(err)
  })
}

function compare (a, b) {
  return b.created - a.created
}

/**
 * Saves a file to google storage and to datastore (meta data)
 * @param req {Object} request object
 * @param res {Object} response object
 * @return {Promise} Save data to datastore promise
 */
// function postTask (req, res) {
//   const createPromise = Promise.promisify(datastore.create)

//   let data = req.body

//   const taskEntry = task.createTask(data)

//   console.error('Post Task Data is: ', taskEntry)

//   return createPromise(taskEntry, indexKeys)

//   .then(savedTask => {
//     console.error('Saved Data id: ', savedTask.id)
//     res.send('Task Created! ' + '   saved dataid: ' + savedTask.id)
//   })

//   .catch(err => {
//     res.send('Error Saving Task: ' + err)
//   })
// }

function listTasks (req, res) {
  const prom = Promise.promisify(datastore.list)
  const options = {
    limit: 10,
    type: 'task',
    order: 'name'
  }

  const transformation = req.query.hasOwnProperty('calendar') && req.query.calendar === 'true'
  console.error('*************************transformation is: ', transformation)
  return prom(options, req.query.pageToken)
  .then((entities, cursor) => {
    if (!transformation) {
      return res.json({
        items: entities,
        nextPageToken: cursor
      })
    } else {
      res.json(calendarTransform(entities))
    }
  })
  .catch((err) => {
    console.error('Error in listTasks: ', err)
  })
}

function calendarTransform (items) {
  console.error('ITEMS ARE:', items)
  return items.reduce((prev, item) => {
    if (!item.intervals) {
      return prev
    }

    const title = item.name
    const desc = item.description
    console.error('item.intervals are:', item.intervals)
    item.intervals.forEach(interval => {
      const arr = interval.split('-')
      const start = new Date(parseInt(arr[0]))
      const end = new Date(parseInt(arr[1]))

      const calendarEntry = {
        title,
        desc,
        start,
        end
      }

      prev.push(calendarEntry)
    })

    return prev
  }, [])
}
module.exports = {
  getTask: getTask,
  listTasks: listTasks,
  postTask: postTask
}
