import express, { Request, Response } from 'express'

const makeapp = (version: string) => {
  const app = express()

  app.get('/', (_: Request, response: Response) =>
    response.json({ version }),
  )

  return app
}

export default makeapp
