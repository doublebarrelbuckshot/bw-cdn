'use strict'

const usersCtrl = require('../../src/controllers/users')

describe('users controllers', () => {
  test('should return a list of users', () => {
    const result = usersCtrl._findAll()

    expect(Array.isArray(result)).toEqual(true)
  })

  test('should return a user', () => {
    const users = usersCtrl._findAll()
    const user = users[2]
    const result = usersCtrl._findOne(user.uuid)

    expect(Array.isArray(result)).toEqual(true)
    expect(result[0].name).toEqual(user.name)
  })
})
