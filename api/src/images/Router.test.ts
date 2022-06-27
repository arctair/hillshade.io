import express from 'express'
import request from 'supertest'
import Router from './Router'

describe('router', () => {
  const app = express()
  app.use('/', Router())

  test('post image', async () => {
    const response = await request(app)
      .post('/images')
      .set('Content-Type', 'image/png')
    expect(response.status).toEqual(201)
    expect(response.body).toEqual({ key: 'abcd.png' })
  })
})
