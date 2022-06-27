import express from 'express'
import request from 'supertest'
import { Router } from './Router'
import { errNoLayoutWithKey } from './Store'

describe('layout router', () => {
  const checker = {
    create: jest.fn(),
    patch: jest.fn(),
  }

  const store = {
    getAll: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
  }

  const app = express()
  app.use('/', Router(checker, store))

  test('get layouts', async () => {
    store.getAll.mockReturnValue({ layouts: [] })
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ layouts: [] })
  })

  test('create layout', async () => {
    const upLayout = { size: [256, 256] }
    const downLayout = { key: 'abcd', size: [256, 256] }
    checker.create.mockReturnValue([])
    store.create.mockReturnValue(downLayout)

    const response = await request(app).post('/').send(upLayout)

    expect(response.status).toEqual(201)
    expect(store.create).toHaveBeenCalledWith(upLayout)
    expect(response.body).toEqual(downLayout)
  })

  test('create malformed layout returns 400 bad request with descriptive error', async () => {
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

  test('upsert layout with heightmap url', async () => {
    const upLayoutPatch = { heightmapURL: 'new url' }
    const downLayout = { down: 'layout' }
    checker.patch.mockReturnValue([])
    store.patch.mockReturnValue([downLayout, undefined])
    const response = await request(app)
      .patch('/layouts/abcdefg')
      .send(upLayoutPatch)

    expect(response.status).toEqual(200)
    expect(response.body).toEqual(downLayout)
    expect(store.patch).toHaveBeenCalledWith('abcdefg', upLayoutPatch)
  })

  test('upsert malformed patch returns 400 bad request with descriptive error', async () => {
    const upPatch = { the: 'patch' }
    const downErrors = ['the errors']
    checker.patch.mockReturnValue(downErrors)
    const response = await request(app)
      .patch('/layouts/abcdefg')
      .send(upPatch)

    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ errors: downErrors })
    expect(checker.patch).toHaveBeenCalledWith(upPatch)
  })

  test('upsert patch to key that is not present', async () => {
    const upPatch = { the: 'patch' }
    checker.patch.mockReturnValue([])
    store.patch.mockReturnValue([null, errNoLayoutWithKey])
    const response = await request(app)
      .patch('/layouts/abcdefg')
      .send(upPatch)

    expect(response.status).toEqual(404)
    expect(response.body).toEqual({
      errors: [errNoLayoutWithKey],
    })
  })

  test('upsert patch generic error', async () => {
    const upPatch = { another: 'patch' }
    checker.patch.mockReturnValue([])
    store.patch.mockReturnValue([null, 'another error'])
    const response = await request(app)
      .patch('/layouts/fhfhfh')
      .send(upPatch)

    expect(response.status).toEqual(500)
    expect(response.body).toEqual({
      errors: ['another error'],
    })
  })
})
