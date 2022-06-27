import express, { Request, Response } from 'express'
import { Checks } from './checks'
import { errKeyNotFound, Store } from './Store'

export const Router = (
  checks: {
    create: Checks
    patch: Checks
  },
  store: Store,
) => {
  const router = express.Router()

  router.use(express.json())

  router.get('/', (_: Request, response: Response) =>
    response.json(store.getAll()),
  )

  router.post('/', (request: Request, response: Response) => {
    const errors = checks.create(request.body)
    if (errors.length > 0) {
      response.status(400).send({ errors })
    } else {
      const layout = store.create(request.body)
      response.status(201).send(layout)
    }
  })

  router.patch('/layouts/:key', (request: Request, response: Response) => {
    const errors = checks.patch(request.body)
    if (errors.length > 0) {
      response.status(400).send({ errors })
    } else {
      const [layout, error] = store.patch(
        request.params['key'],
        request.body,
      )
      switch (error) {
        case undefined:
          return response.send(layout)
        case errKeyNotFound:
          return response.status(404).send({ errors: [error] })
        default:
          return response.status(500).send({ errors: [error] })
      }
    }
  })

  return router
}
