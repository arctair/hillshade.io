import express, { Request, Response } from 'express'

import { errKeyNotFound, errNoContentType, Store } from './Store'

export default function Router(store: Store) {
  return express
    .Router()
    .use(express.raw({ type: '*/*', limit: '4mb' }))
    .post('/images', (request: Request, response: Response) => {
      const contentType = request.header('Content-Type')!
      const [key, error] = store.create(contentType, request.body)
      switch (error) {
        case undefined:
          return response.status(201).send({ key })
        case errNoContentType:
          return response.status(400).send({ error })
        default:
          return response.status(500).send({ error })
      }
    })
    .get(
      '/images/:key.:extension',
      (request: Request, response: Response) => {
        const [contentType, buffer, error] = store.get(
          request.params['key'],
        )
        switch (error) {
          case undefined:
            return response.status(200).type(contentType!).send(buffer)
          case errKeyNotFound:
            return response.status(404).send({ error })
          default:
            return response.status(500).send({ error })
        }
      },
    )
}
