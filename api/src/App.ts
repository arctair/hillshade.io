import express from 'express'

export const createApp = (
  versionRouter: express.Router,
  layoutRouter: express.Router,
) => {
  const app = express()

  app.use('/', layoutRouter)
  app.use('/', versionRouter)

  return app
}
