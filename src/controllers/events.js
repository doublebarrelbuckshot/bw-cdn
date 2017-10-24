/** @module controllers/files */
'use strict'
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const debug = require('debug')('src:controllers:assets')
const Promise = require('bluebird')
const parse = require('csv-parse/lib/sync')
const moment = require('moment')

/**
 * entry endpoint
 * @param  {Object} req
 * @param  {Object} res
 * @return {Object}
 */
function get (req, res) {
  const csv = fs.readFileSync(path.join(__dirname, '../csv/test.csv'), 'utf8')
  console.error('CSV IS:', csv)

  const options = {
    auto_parse_date: true
  }
  const records = parse(csv, options)

  console.error('Records are: ', JSON.stringify(records, null, 2))

  const processed = records.map(row => processRow(row))

  const lengths = processed.map(row => {
    return row.data.length
  })

  console.error('LENGTHS ARE*********************')
  console.error(lengths)
  console.error('********************************')
  //debug(`result length sent back ${result.length}`)
  res.status(200).json(processed)
}

function processRow (row) {
  const timestamp = Date.parse(row[1])
  const isHeader = !isNaN(timestamp)
  const data = row.filter(item => {
    return item.length > 0
  })

  return {
    isHeader,
    data,
    timestamp
  }
}
module.exports = {
  get: get
}
