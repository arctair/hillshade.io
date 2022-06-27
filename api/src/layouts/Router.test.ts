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
    create: jest.fn(),
    patch: jest.fn(),
  }

  const app = express()
  app.use('/', Router(checker, store))

  test('get layouts - proxy keyed layouts down', async () => {
    store.getAll.mockReturnValue({ layouts: [] })
    const response = await request(app).get('/')
    expect(response.status).toEqual(200)
    expect(response.body).toEqual({ layouts: [] })
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
      store.patch.mockReturnValue([{ down: 'layout' }, undefined])
      const response = await request(app)
        .patch('/layouts/abcdefg')
        .send({ any: 'patch' })

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({ down: 'layout' })
      expect(store.patch).toHaveBeenCalledWith('abcdefg', { any: 'patch' })
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
