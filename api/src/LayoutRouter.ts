import express, { Request, Response } from 'express'
import { LayoutService } from './LayoutService'

export const createLayoutRouter = (layoutService: LayoutService) => {
  const router = express.Router()

  router.use(express.json())

  router.get('/', (_: Request, response: Response) =>
    response.json(layoutService.getAll()),
  )

  router.post('/', (request: Request, response: Response) => {
    const layout = layoutService.create(request.body)
    response.status(201).send(layout)
  })

  return router
}
