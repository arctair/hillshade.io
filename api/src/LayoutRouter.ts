import express, { Request, Response } from 'express'
import { LayoutService } from './LayoutService'
import { LayoutValidity } from './LayoutValidity'

export const createLayoutRouter = (
  layoutValidity: LayoutValidity,
  layoutService: LayoutService,
) => {
  const router = express.Router()

  router.use(express.json())

  router.get('/', (_: Request, response: Response) =>
    response.json(layoutService.getAll()),
  )

  router.post('/', (request: Request, response: Response) => {
    const errors = layoutValidity.check(request.body)
    if (errors.length > 0) {
      response.status(400).send({ errors })
    } else {
      const layout = layoutService.create(request.body)
      response.status(201).send(layout)
    }
  })

  return router
}
