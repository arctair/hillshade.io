import nodeFetch from 'node-fetch'

describe('app', () => {
  test('get version', async () => {
    const response = await nodeFetch('http://localhost:8080/')
    const body = (await response.json()) as any
    expect(body.version).toHaveLength(7)
  })
})
