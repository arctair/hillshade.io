import express, { Request, Response } from 'express'
import { LayoutService } from './LayoutService'

export const createApp = (
  version: string,
  layoutService: LayoutService,
) => {
  const app = express()

  app.use(express.json())

  app.get('/version', (_: Request, response: Response) =>
    response.json({ version }),
  )

  app.get('/', (_: Request, response: Response) =>
    response.json(layoutService.getAll()),
  )

  app.post('/', (request: Request, response: Response) => {
    const layout = layoutService.create(request.body)
    response.status(201).send(layout)
  })

  return app
}
