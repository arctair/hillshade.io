import express from 'express'
import request from 'supertest'
import { createRouter } from './Router'

describe('layout router', () => {
  const checker = {
    check: jest.fn(),
  }

  const store = {
    getAll: jest.fn(),
    create: jest.fn(),
  }

  const app = express()
  app.use('/', createRouter(checker, store))

  test('get layouts', async () => {
    store.getAll.mockReturnValue({ layouts: [] })
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ layouts: [] })
  })

  test('create layout', async () => {
    const upLayout = { size: [256, 256] }
    const downLayout = { key: 'abcd', size: [256, 256] }
    checker.check.mockReturnValue([])
    store.create.mockReturnValue(downLayout)

    const response = await request(app).post('/').send(upLayout)

    expect(response.status).toEqual(201)
    expect(store.create).toHaveBeenCalledWith(upLayout)
    expect(response.body).toEqual(downLayout)
  })

  test('create layout without field returns 400 bad request with descriptive error', async () => {
    checker.check.mockReturnValue([
      'Field "size" of type [number, number] is missing',
    ])
    const upLayout = { dorp: 'dorp' }
    const response = await request(app).post('/').send(upLayout)

    expect(checker.check).toHaveBeenCalledWith(upLayout)
    expect(response.status).toEqual(400)
    expect(response.body).toEqual({
      errors: ['Field "size" of type [number, number] is missing'],
    })
  })
})
