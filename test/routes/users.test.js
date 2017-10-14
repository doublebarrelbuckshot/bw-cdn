'use strict'

const request = require('supertest')
const app = require('../../app')

describe('users route', () => {
  describe('/users', () => {
    test('should respond with json', () => {
      return request(app)
        .get('/api/v1/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
    })

    test('should get a collection of object', () => {
      return request(app)
        .get('/api/v1/users')
        .expect('Content-Type', /json/)
        .expect(200)
        .set('Accept', 'application/json')
        .expect((res) => {
          expect(Array.isArray(res.body)).toEqual(true)
        })
    })
  })

  describe('/users/:uuid', () => {
    test('should respond with json', () => {
      return request(app)
        .get('/api/v1/users/123456')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
    })

    test('should return an empty array when nothing is found', () => {
      return request(app)
        .get('/api/v1/users/123456')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body.length).toEqual(0)
        })
    })

    test('should return user.', () => {
      const prom = request(app)
        .get('/api/v1/users')
        .set('Accept', 'application/json')
        .expect(200)
        .expect('Content-Type', /json/)
        .then(res => res.body[0])

      prom
      .then(user => {
        return request(app)
          .get(`/api/v1/users/${user.uuid}`)
          .set('Accept', 'application/json')
          .expect(200)
          .expect('Content-Type', /json/)
          .then(res => {
            expect(res.name).toEqual(user.name)
          })
      })
    })
  })
})
