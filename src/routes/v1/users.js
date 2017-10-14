'use strict'

/** @module routes/v1/users */
const Joi = require('joi')
const users = require('../../controllers/users')

const errorSchema = {
  statusCode: Joi.number().required(),
  error: Joi.string().required(),
  message: Joi.string().required()
}

const usersRte = [
  {
    url: '/users/',
    method: 'get',
    handler: users.get,
    response: {
      status: {
        200: Joi.array().required().items(
          Joi.object().keys({
            name: Joi.string(),
            uuid: Joi.string()
          })
        ).description('collection of users'),
        400: Joi.object().keys(errorSchema),
        404: Joi.object().keys(errorSchema)
      }
    },
    description: 'description',
    notes: 'notes',
    tags: ['api', 'users']
  },
  {
    url: '/users/:uuid/',
    method: 'get',
    handler: users.get,
    response: {
      status: {
        200: Joi.array().required().items(
          Joi.object().keys({
            name: Joi.string(),
            uuid: Joi.string()
          })
        ),
        400: Joi.object().keys(errorSchema),
        404: Joi.object().keys(errorSchema)
      }
    },
    description: 'description',
    notes: 'notes',
    tags: ['api', 'users']
  }
]

module.exports = usersRte
