import express from 'express'

export const App = (...routers: express.Router[]) => {
  const app = express()
  routers.forEach((router) => app.use('/', router))
  return app
}
