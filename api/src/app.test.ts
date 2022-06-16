import nodeFetch from 'node-fetch'

const baseURL = process.env.BASE_URL || 'http://localhost:8080'

describe('app', () => {
  test('get version', async () => {
    const response = await nodeFetch(baseURL)
    const body = (await response.json()) as any
    expect(body.version).toHaveLength(7)
  })
})
