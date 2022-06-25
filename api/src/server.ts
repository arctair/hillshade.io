import { check as checkExtent } from './layouts/ExtentChecker'
import { check as checkSize } from './layouts/SizeChecker'
import {
  checkNotPresent as checkHeightmapURLNotPresent,
  checkPresent as checkHeightmapURLPresent,
} from './layouts/HeightmapURLChecker'
import { create as createChecks } from './layouts/Checks'
import { create as createApp } from './App'
import { create as createLayoutRouter } from './layouts/Router'
import { create as createLayoutStore } from './layouts/Store'
import { create as createVersionRouter } from './VersionRouter'

const version = process.env.VERSION || 'dev'
const port = process.env.PORT || 8080
const app = createApp(
  createVersionRouter(version),
  createLayoutRouter(
    {
      create: createChecks(
        checkExtent,
        checkSize,
        checkHeightmapURLNotPresent,
      ),
      patch: createChecks(checkHeightmapURLPresent),
    },
    createLayoutStore(),
  ),
)
app.listen(port, () => console.log(`0.0.0.0:${port}`))
