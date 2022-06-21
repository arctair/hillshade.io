import express from 'express'
import request from 'supertest'
import { createLayoutRouter } from './LayoutRouter'

describe('layout router', () => {
  const layoutService = {
    getAll: jest.fn(),
    create: jest.fn(),
  }

  const app = express()
  app.use('/', createLayoutRouter(layoutService))

  test('get layouts', async () => {
    layoutService.getAll.mockReturnValue({ layouts: [] })
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ layouts: [] })
  })

  test('create layout', async () => {
    const upLayout = { size: [256, 256] }
    const downLayout = { key: 'abcd', size: [256, 256] }
    layoutService.create.mockReturnValue(downLayout)

    const response = await request(app).post('/').send(upLayout)

    expect(response.status).toEqual(201)
    expect(layoutService.create).toHaveBeenCalledWith(upLayout)
    expect(response.body).toEqual(downLayout)
  })
})
