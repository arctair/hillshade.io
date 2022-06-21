import express, { Request, Response } from 'express'

export const createVersionRouter = (version: string) => {
  const router = express.Router()

  router.use(express.json())

  router.get('/version', (_: Request, response: Response) =>
    response.json({ version }),
  )

  return router
}
