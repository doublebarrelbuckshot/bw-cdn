'use strict'

/** @module routes/v1/users */
const Joi = require('joi')
const files = require('../../controllers/files')

const errorSchema = {
  statusCode: Joi.number().required(),
  error: Joi.string().required(),
  message: Joi.string().required()
}

const filesRte = [
  {
    url: '/files/',
    method: 'get',
    handler: files.listFiles,
    description: 'Returns list of assets available',
    notes: 'notes',
    tags: ['files']
  }, {
    url: '/files/:name/',
    method: 'get',
    handler: files.getFile,
    description: 'Returns list of assets available',
    notes: 'notes',
    tags: ['files']
  }, {
    url: '/files/:name',
    method: 'post',
    validate: {
      query: {
        tags: Joi.array().items(Joi.string())
      }
    },
    handler: files.postFile,
    description: 'Returns list of assets available',
    notes: 'notes',
    tags: ['files']
  }
]

module.exports = filesRte
