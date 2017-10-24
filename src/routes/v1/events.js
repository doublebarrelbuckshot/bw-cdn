'use strict'

/** @module routes/v1/users */
const Joi = require('joi')
const assets = require('../../controllers/events')

const errorSchema = {
  statusCode: Joi.number().required(),
  error: Joi.string().required(),
  message: Joi.string().required()
}

const assetsRte = [
  {
    url: '/events/',
    method: 'get',
    handler: assets.get,
    response: {
      status: {
        200: Joi.array().required().items(
          Joi.object())
        .description('collection of asset names'),
        400: Joi.object().keys(errorSchema),
        404: Joi.object().keys(errorSchema)
      }
    },
    description: 'Returns list of events',
    notes: 'notes',
    tags: ['api', 'events']
  }
]

module.exports = assetsRte
