'use strict'

const path = require('path')
const loadConfig = require('../../utils/loadConfig')

describe('[utils] loadConfig', () => {
  test('loadCOnfig module should be successful', () => {
    const dir = path.join(__dirname, '..', '..', 'config/')
    const projectRoot = path.join(__dirname, '..', '..', 'config')

    const result = loadConfig(dir, projectRoot)
    const config = result.get()

    expect(config.name).toBe('test')
    expect(config.env).toBe('test')
  })

  test('loadCOnfig module should throw if config directory doesn\'t exist', () => {
    const dir = path.join(__dirname, '..', '..', 'confg/')
    const projectRoot = path.join(__dirname, '..', '..', 'config')

    expect(() => {
      loadConfig(dir, projectRoot)
    }).toThrow()
  })
})
