import express from 'express'
import request from 'supertest'
import Router from './Router'

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
})
