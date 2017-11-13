'use strict'

/** @module routes/v1/users */
const Joi = require('joi')
const assets = require('../../controllers/assets')

const errorSchema = {
  statusCode: Joi.number().required(),
  error: Joi.string().required(),
  message: Joi.string().required()
}

const assetsRte = [
  {
    url: '/assets/',
    method: 'get',
    handler: assets.get,
    response: {
      status: {
        200: Joi.array().required().items(
          Joi.string())
        .description('collection of asset names'),
        400: Joi.object().keys(errorSchema),
        404: Joi.object().keys(errorSchema)
      }
    },
    description: 'Returns list of assets available',
    notes: 'notes',
    tags: ['api', 'assets']
  }, {
    url: '/assets/:name/',
    method: 'get',
    handler: assets.getFile,
    description: 'Returns list of assets available',
    notes: 'notes',
    tags: ['api', 'assets']
  }, {
    url: '/meta/list/',
    method: 'get',
    handler: assets.listFiles,
    description: 'Returns list of assets available',
    notes: 'notes',
    tags: ['api', 'assets']
  }
]

module.exports = assetsRte
