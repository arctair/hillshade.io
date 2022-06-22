import { create as createApp } from './App'
import { create as createExtentChecker } from './layouts/ExtentChecker'
import { create as createHeightmapURLChecker } from './layouts/HeightmapURLChecker'
import { create as createLayoutChecker } from './layouts/Checker'
import { create as createLayoutRouter } from './layouts/Router'
import { create as createLayoutStore } from './layouts/Store'
import { create as createSizeChecker } from './layouts/SizeChecker'
import { create as createVersionRouter } from './VersionRouter'

const version = process.env.VERSION || 'dev'
const port = process.env.PORT || 8080
const app = createApp(
  createVersionRouter(version),
  createLayoutRouter(
    createLayoutChecker([
      createExtentChecker(),
      createHeightmapURLChecker(),
      createSizeChecker(),
    ]),
    createLayoutStore(),
  ),
)
app.listen(port, () => console.log(`0.0.0.0:${port}`))
