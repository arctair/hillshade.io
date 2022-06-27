import express from 'express'
import request from 'supertest'
import Router from './Router'
import { errNoContentType } from './Store'

describe('router', () => {
  const store = {
    create: jest.fn(),
  }

  const app = express()
  app.use('/', Router(store))

  test('post image', async () => {
    store.create.mockReturnValue(['abcd.jpg', undefined])
    const response = await request(app)
      .post('/images')
      .set('Content-Type', 'image/png')
    expect(response.status).toEqual(201)
    expect(response.body).toEqual({ key: 'abcd.jpg' })
    expect(store.create).toHaveBeenCalledWith('image/png')
  })

  test('post image error', async () => {
    store.create.mockReturnValue([undefined, 'random error'])
    const response = await request(app)
      .post('/images')
      .set('Content-Type', 'image/jpg')
    expect(response.status).toEqual(500)
    expect(response.body).toEqual({ error: 'random error' })
    expect(store.create).toHaveBeenCalledWith('image/jpg')
  })

  test('post image with no content type results in bad request', async () => {
    store.create.mockReturnValue([undefined, errNoContentType])
    const response = await request(app).post('/images')
    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ error: errNoContentType })
    expect(store.create).toHaveBeenCalledWith(undefined)
  })
})
