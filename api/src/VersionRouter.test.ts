import express from 'express'
import request from 'supertest'
import { create } from './VersionRouter'

describe('version router', () => {
  const app = express()
  app.use('/', create('asddfgf'))
  test('get version', async () => {
    const response = await request(app).get('/version')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ version: 'asddfgf' })
  })
})
