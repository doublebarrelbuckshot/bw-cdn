'use strict'

const request = require('supertest')
const app = require('../app')

describe('users route', () => {
  describe('/boom', () => {
    test('should launch back a Boom error', () => {
      return request(app)
        .get('/boom')
        .set('Accept', 'application/json')
        .expect(500)
    })
  })
})
