import { createLayoutService } from './LayoutService'
import { createApp } from './App'

const version = process.env.VERSION || 'dev'
const port = process.env.PORT || 8080
const app = createApp(version, createLayoutService())
app.listen(port, () => console.log(`0.0.0.0:${port}`))
