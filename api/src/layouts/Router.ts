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
    if (errors.length > 0) return response.status(400).send({ errors })

    let patch = request.body
    if (patch.attachments)
      patch = {
        ...patch,
        attachments: new Map(Object.entries(patch.attachments)),
      }

    const [layout, error] = store.patch(request.params['key'], patch)
    switch (error) {
      case undefined:
        let body = layout!
        return response.send({
          ...body,
          attachments: map2obj(body.attachments),
        })
      case errKeyNotFound:
        return response.status(404).send({ errors: [error] })
      default:
        return response.status(500).send({ errors: [error] })
    }
  })

  return router
}

function map2obj(map: Map<string, string>): any {
  return Array.from(map).reduce((obj, [key, value]) => {
    obj[key] = value
    return obj
  }, {} as any)
}
