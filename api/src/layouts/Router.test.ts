import express from 'express'
import request from 'supertest'
import { Router } from './Router'
import { errKeyNotFound } from './Store'

describe('layout router', () => {
  const checker = {
    create: jest.fn(),
    patch: jest.fn(),
  }

  const store = {
    getAll: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
  }

  afterEach(jest.clearAllMocks)

  const app = express()
  app.use('/', Router(checker, store))

  test('get layouts - proxy keyed layouts down with transformed attachments', async () => {
    store.getAll.mockReturnValue({
      layouts: [
        { some: 'stuff', attachments: new Map([['some', 'attachment']]) },
      ],
    })
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      layouts: [{ some: 'stuff', attachments: { some: 'attachment' } }],
    })
  })

  describe('get layout by key', () => {
    test('proxy key up and proxy layout down with attachments transformed', async () => {
      store.get.mockReturnValue([
        {
          the: 'layout yay',
          attachments: new Map([['some', 'attachment']]),
        },
        undefined,
      ])
      const response = await request(app).get('/layouts/somekey')
      expect(response.status).toEqual(200)
      expect(response.body).toEqual({
        the: 'layout yay',
        attachments: { some: 'attachment' },
      })
      expect(store.get).toHaveBeenCalledWith('somekey')
    })
    test('proxy key up and proxy key not found error down with not found status code', async () => {
      store.get.mockReturnValue([undefined, errKeyNotFound])
      const response = await request(app).get('/layouts/anotherkey')
      expect(response.status).toEqual(404)
      expect(response.body).toEqual({ error: errKeyNotFound })
      expect(store.get).toHaveBeenCalledWith('anotherkey')
    })
    test('proxy key up and proxy error down with default server error status code', async () => {
      store.get.mockReturnValue([undefined, 'some error'])
      const response = await request(app).get('/layouts/boomkey')
      expect(response.status).toEqual(500)
      expect(response.body).toEqual({ error: 'some error' })
      expect(store.get).toHaveBeenCalledWith('boomkey')
    })
  })

  describe('create', () => {
    test('proxy layout up and proxy keyed layout down ', async () => {
      checker.create.mockReturnValue([])
      store.create.mockReturnValue({ key: 'abcd', size: [256, 256] })
      const response = await request(app)
        .post('/')
        .send({ size: [256, 256] })
      expect(response.status).toEqual(201)
      expect(response.body).toEqual({ key: 'abcd', size: [256, 256] })
      expect(store.create).toHaveBeenCalledWith({ size: [256, 256] })
    })

    test('proxy layout up and proxy check error down with bad request status code', async () => {
      checker.create.mockReturnValue([
        'Field "size" of type [number, number] is missing',
      ])
      const upLayout = { dorp: 'dorp' }
      const response = await request(app).post('/').send(upLayout)

      expect(checker.create).toHaveBeenCalledWith(upLayout)
      expect(response.status).toEqual(400)
      expect(response.body).toEqual({
        errors: ['Field "size" of type [number, number] is missing'],
      })
    })
  })

  describe('patch', () => {
    test('proxy patch up and proxy keyed layout down', async () => {
      checker.patch.mockReturnValue([])
      store.patch.mockReturnValue([
        { down: 'layout', attachments: new Map() },
        undefined,
      ])
      const response = await request(app)
        .patch('/layouts/abcdefg')
        .send({ any: 'patch' })

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({ down: 'layout', attachments: {} })
      expect(store.patch).toHaveBeenCalledWith('abcdefg', { any: 'patch' })
    })

    test('proxy patch up with attachments converted to map and keyed layout down with attachments converted to object', async () => {
      checker.patch.mockReturnValue([])
      store.patch.mockReturnValue([
        {
          attachments: new Map([['heightmap1', 'another jpg']]),
          another: 'property',
        },
        undefined,
      ])
      const response = await request(app)
        .patch('/layouts/asnda')
        .send({ attachments: { heightmap0: 'some jpg' } })

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({
        attachments: { heightmap1: 'another jpg' },
        another: 'property',
      })
      expect(store.patch).toHaveBeenCalledWith('asnda', {
        attachments: new Map([['heightmap0', 'some jpg']]),
      })
    })

    test('proxy patch up and proxy patch check error down with bad request status code', async () => {
      checker.patch.mockReturnValue(['the errors'])
      const response = await request(app)
        .patch('/layouts/abcdefg')
        .send({ the: 'patch' })
      expect(response.status).toEqual(400)
      expect(response.body).toEqual({ errors: ['the errors'] })
      expect(checker.patch).toHaveBeenCalledWith({ the: 'patch' })
    })

    test('proxy patch up and proxy key not found error down with not found status code', async () => {
      checker.patch.mockReturnValue([])
      store.patch.mockReturnValue([null, errKeyNotFound])
      const response = await request(app)
        .patch('/layouts/abcdefg')
        .send({ the: 'patch' })

      expect(response.status).toEqual(404)
      expect(response.body).toEqual({
        errors: [errKeyNotFound],
      })
      expect(store.patch).toHaveBeenCalledWith('abcdefg', { the: 'patch' })
    })

    test('proxy patch up and proxy error down with default server error status code', async () => {
      checker.patch.mockReturnValue([])
      store.patch.mockReturnValue([null, 'another error'])
      const response = await request(app)
        .patch('/layouts/fhfhfh')
        .send({ another: 'patch' })

      expect(response.status).toEqual(500)
      expect(response.body).toEqual({
        errors: ['another error'],
      })
      expect(store.patch).toHaveBeenCalledWith('fhfhfh', {
        another: 'patch',
      })
    })
  })
})
