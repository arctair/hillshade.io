import express, { Request, Response } from 'express'

export default function Router() {
  return express
    .Router()
    .post('/images', (_: Request, response: Response) => {
      response.status(201).send({ key: 'abcd.png' })
    })
}
