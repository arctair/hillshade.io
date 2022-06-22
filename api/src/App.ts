import express from 'express'

export const create = (
  versionRouter: express.Router,
  layoutRouter: express.Router,
) => {
  const app = express()

  app.use('/', layoutRouter)
  app.use('/', versionRouter)

  return app
}
