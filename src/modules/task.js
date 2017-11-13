'use strict'
const _ = require('lodash')

/*
 * Creates a properly formatted task object, from either an array or an object
 * @param  {String[] | Object} any either an Object or an array
 * @return {Object}     Properly formatted task object
 */
function createTask (any) {
  if (_.isArray(any)) {
    return _processArray(any)
  } else {
    return _embellishTask(any)
  }
}

/**
 * Converts an array to a properly formatted, embellished task object
 * @param  {String[]} arr Task in array form
 * @return {Object}     Task in object form
 */
function _processArray (arr) {
  const base = {
    name: arr[0],
    start: arr[1],
    end: arr[2],
    description: arr[3],
    fileTags: _convertFileTags(arr[4])
  }

  return _embellishTask(base)
}

/**
 * Adds necessary meta fields to the task
 * @param  {Object} o Original task object
 * @return {Object}   Embellished task object
 */
function _embellishTask (o) {
  return _.assignIn({}, o, {
    type: 'task',
    created: new Date().getTime()
  })
}

/**
 * Converts a string of the type ' tag1, tag2,tag3'
 * to an array of the form ['tag1', 'tag2', 'tag3']
 * @param  {String} str input string
 * @return {String[]}    String converted into properly formatted array
 */
function _convertFileTags (str) {
  const noWhiteSpace = str.replace(/\s/g, '')

  return noWhiteSpace.split(',')
}

module.exports = {
  createTask: createTask
}
