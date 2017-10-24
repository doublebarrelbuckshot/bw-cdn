/** @module controllers/users */
'use strict'

const _ = require('lodash')
const debug = require('debug')('src:controllers:users')
const generateUsers = require('../../test/__fixtures__/users')
const Promise = require('bluebird')
const users = generateUsers(20)

/**
 * return a collection of users from 0 to n
 * @param  {Number} uuid      user uuid's
 * @return {Object[]}         users collection
 */
function _findOne (uuid) {
  const user = _.find(users, { uuid: uuid })

  return user ? [user] : []
}

/**
 * return all users
 * @return {Object[]}      users
 */
function _findAll () {
  return users
}

/**
 * entry endpoint
 * @param  {Object} req
 * @param  {Object} res
 * @return {Object}
 */
function get (req, res) {
  return Promise.delay(5000)
  .then(() => {
    const uuid = req.params.uuid
    const result = uuid ? _findOne(uuid) : _findAll()
    debug(`result length sent back ${result.length}`)
    return Promise.resolve(result) 
  })
  .then((result) => res.status(200).json(result))
}

module.exports = { get: get }
