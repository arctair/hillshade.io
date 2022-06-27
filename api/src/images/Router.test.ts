import express from 'express'
import request from 'supertest'
import Router from './Router'
import { errKeyNotFound, errNoContentType } from './Store'

describe('router', () => {
  const store = {
    create: jest.fn(),
    get: jest.fn(),
  }

  const app = express()
  app.use('/', Router(store))

  describe('create image', () => {
    test('proxy content type up and key down', async () => {
      store.create.mockReturnValue(['abcd', undefined])
      const response = await request(app)
        .post('/images')
        .set('Content-Type', 'image/png')
      expect(response.status).toEqual(201)
      expect(response.body).toEqual({ key: 'abcd' })
      expect(store.create).toHaveBeenCalledWith('image/png')
    })

    test('proxy content type up and error down with default server error status', async () => {
      store.create.mockReturnValue([undefined, 'random error'])
      const response = await request(app)
        .post('/images')
        .set('Content-Type', 'image/jpg')
      expect(response.status).toEqual(500)
      expect(response.body).toEqual({ error: 'random error' })
      expect(store.create).toHaveBeenCalledWith('image/jpg')
    })

    test('proxy content type up and no content type error down with bad request status', async () => {
      store.create.mockReturnValue([undefined, errNoContentType])
      const response = await request(app).post('/images')
      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ error: errNoContentType })
      expect(store.create).toHaveBeenCalledWith(undefined)
    })
  })

  describe('get image', () => {
    test('proxy key up and content type down', async () => {
      store.get.mockReturnValue(['image/png', undefined])
      const response = await request(app).get('/images/abcd.jpg')
      expect(response.status).toEqual(200)
      expect(response.headers['content-type']).toBe(
        'image/png; charset=utf-8',
      )
      expect(store.get).toHaveBeenCalledWith('abcd')
    })

    test('proxy key up and error down with default server error status', async () => {
      store.get.mockReturnValue([undefined, 'boom'])
      const response = await request(app).get('/images/abcd.png')
      expect(response.status).toEqual(500)
      expect(response.body).toEqual({ error: 'boom' })
      expect(store.get).toHaveBeenCalledWith('abcd')
    })

    test('proxy key up and key not found error down with not found error status', async () => {
      store.get.mockReturnValue([undefined, errKeyNotFound])
      const response = await request(app).get('/images/bdca.tif')
      expect(response.status).toEqual(404)
      expect(response.body).toEqual({ error: errKeyNotFound })
      expect(store.get).toHaveBeenCalledWith('bdca')
    })
  })
})
