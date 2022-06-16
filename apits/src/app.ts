import express, { Request, Response } from 'express'

const app = express()
const port = process.env.PORT || 8080
const version = process.env.VERSION || 'dev'

app.get('/', (_: Request, response: Response) =>
  response.json({ version }),
)

app.listen(port, () => console.log(`0.0.0.0:${port}`))
