import express, { Request, Response } from 'express'

export default function Router(store: any) {
  return express
    .Router()
    .post('/images', (request: Request, response: Response) => {
      const contentType = request.header('Content-Type')
      const [key, error] = store.create(contentType)
      switch (error) {
        case undefined:
          return response.status(201).send({ key })
        default:
          return response.status(500).send({ error })
      }
    })
}
