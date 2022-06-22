import { createLayoutStore } from './LayoutStore'
import { createApp } from './App'
import { createVersionRouter } from './VersionRouter'
import { createLayoutRouter } from './LayoutRouter'
import { createLayoutValidity } from './LayoutValidity'

const version = process.env.VERSION || 'dev'
const port = process.env.PORT || 8080
const app = createApp(
  createVersionRouter(version),
  createLayoutRouter(createLayoutValidity(), createLayoutStore()),
)
app.listen(port, () => console.log(`0.0.0.0:${port}`))
