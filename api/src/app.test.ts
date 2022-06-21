import request from 'supertest'
import app from './app'

describe('app', () => {
  test('get version', (done) => {
    request(app('asddfgf'))
      .get('/')
      .expect(200, { version: 'asddfgf' }, done)
  })
})
