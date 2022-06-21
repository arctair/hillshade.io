import app from './app'

const port = process.env.PORT || 8080
app(process.env.VERSION || 'dev').listen(port, () =>
  console.log(`0.0.0.0:${port}`),
)
