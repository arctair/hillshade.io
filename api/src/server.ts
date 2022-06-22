import { createApp } from './App'
import { createChecker as createLayoutChecker } from './layouts/Checker'
import { createRouter as createLayoutRouter } from './layouts/Router'
import { createSizeChecker } from './layouts/SizeChecker'
import { createStore as createLayoutStore } from './layouts/Store'
import { createVersionRouter } from './VersionRouter'

const version = process.env.VERSION || 'dev'
const port = process.env.PORT || 8080
const app = createApp(
  createVersionRouter(version),
  createLayoutRouter(
    createLayoutChecker(createSizeChecker()),
    createLayoutStore(),
  ),
)
app.listen(port, () => console.log(`0.0.0.0:${port}`))
