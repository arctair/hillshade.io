import express, { Request, Response } from 'express'
import { Store } from './Store'
import { Checker } from './Checker'

export const create = ({ check }: Checker, store: Store) => {
  const router = express.Router()

  router.use(express.json())

  router.get('/', (_: Request, response: Response) =>
    response.json(store.getAll()),
  )

  router.post('/', (request: Request, response: Response) => {
    const errors = check(request.body)
    if (errors.length > 0) {
      response.status(400).send({ errors })
    } else {
      const layout = store.create(request.body)
      response.status(201).send(layout)
    }
  })

  return router
}
