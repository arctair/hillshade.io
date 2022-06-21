import express from 'express'
import request from 'supertest'
import { createVersionRouter } from './VersionRouter'

describe('version router', () => {
  const app = express()
  app.use('/', createVersionRouter('asddfgf'))
  test('get version', async () => {
    const response = await request(app).get('/version')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ version: 'asddfgf' })
  })
})
