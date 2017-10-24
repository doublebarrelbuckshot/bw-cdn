/** @module controllers/files */
'use strict'
const path = require('path')

/**
 * entry endpoint
 * @param  {Object} req
 * @param  {Object} res
 * @return {Object}
 */
function get (req, res) {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'))
}

module.exports = {
  get: get
}
