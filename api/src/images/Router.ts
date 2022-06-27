import express, { Request, Response } from 'express'

import { errNoContentType, Store } from './Store'

export default function Router(store: Store) {
  return express
    .Router()
    .post('/images', (request: Request, response: Response) => {
      const contentType = request.header('Content-Type')!
      const [key, error] = store.create(contentType)
      switch (error) {
        case undefined:
          return response.status(201).send({ key })
        case errNoContentType:
          return response.status(400).send({ error })
        default:
          return response.status(500).send({ error })
      }
    })
}
