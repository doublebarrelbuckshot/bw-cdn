'use strict'

/** @module routes/v1/users */
const Joi = require('joi')
const root = require('../../controllers/root')

const errorSchema = {
  statusCode: Joi.number().required(),
  error: Joi.string().required(),
  message: Joi.string().required()
}

const rootRte = [
  {
    url: '/',
    method: 'get',
    handler: root.get,
    description: 'returns index',
    notes: 'notes',
    tags: ['root']
  }
]

module.exports = rootRte
