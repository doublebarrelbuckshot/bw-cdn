'use strict'

const request = require('supertest')
const app = require('../../app')

describe('root route', () => {
  describe('/', () => {
    test('should respond with json', () => {
      return request(app)
        .get('/api/v1/')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
    })
  })
})
