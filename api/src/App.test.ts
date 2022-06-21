import request from 'supertest'
import { createApp } from './App'

describe('app', () => {
  const layoutService = {
    getAll: jest.fn(),
    create: jest.fn(),
  }
  const app = createApp('asddfgf', layoutService)
  test('get version', async () => {
    const response = await request(app).get('/version')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ version: 'asddfgf' })
  })
  test('get layouts', async () => {
    layoutService.getAll.mockReturnValue({ layouts: [] })
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ layouts: [] })
  })
  test('create layout', async () => {
    const upLayout = { size: [256, 256] }
    const downLayout = { id: 'abcd', size: [256, 256] }
    layoutService.create.mockImplementation((layout) => {
      expect(layout).toEqual(upLayout)
      return downLayout
    })

    const response = await request(app).post('/').send(upLayout)

    expect(response.status).toEqual(201)
    expect(response.body).toEqual(downLayout)
  })
})
