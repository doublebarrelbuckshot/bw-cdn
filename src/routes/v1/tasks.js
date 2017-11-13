'use strict'

/** @module routes/v1/users */
const Joi = require('joi')
const tasks = require('../../controllers/tasks')

const errorSchema = {
  statusCode: Joi.number().required(),
  error: Joi.string().required(),
  message: Joi.string().required()
}

const tasksRte = [
  {
    url: '/tasks/',
    method: 'get',
    handler: tasks.listTasks,
    description: 'Returns list of all available tasks',
    notes: 'notes',
    tags: ['files']
  }, {
    url: '/tasks/:name/',
    method: 'get',
    handler: tasks.getTask,
    description: 'Returns an array of tasks by name',
    notes: 'notes',
    tags: ['files']
  }, {
    url: '/tasks/',
    method: 'post',
    validate: {
      query: {
        tags: Joi.array().items(Joi.string())
      }
    },
    handler: tasks.postTask,
    description: 'Create a new task',
    notes: 'notes',
    tags: ['files']
  }
]

module.exports = tasksRte
