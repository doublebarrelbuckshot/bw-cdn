'use strict'

const faker = require('faker')

const generateUsers = (n) => {
  return Array(n).fill().map(item => {
    return {
      name: faker.name.findName(),
      uuid: faker.random.uuid()
    }
  })
}

module.exports = generateUsers
