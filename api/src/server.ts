import { App } from './App'
import { Router as LayoutRouter } from './layouts/Router'
import { Router as VersionRouter } from './VersionRouter'
import { Store as LayoutStore } from './layouts/Store'
import { check as CheckExtent } from './layouts/checks/Extent'
import { check as CheckSize } from './layouts/checks/Size'
import {
  checkNotPresent as CheckHeightmapURLNotPresent,
  checkPresent as CheckHeightmapURLPresent,
} from './layouts/checks/HeightmapURL'
import { create as CheckAll } from './layouts/checks'
import ImageRouter from './images/Router'
import ImageStore from './images/Store'

const version = process.env.VERSION || 'dev'
const port = process.env.PORT || 8080
const app = App(
  VersionRouter(version),
  LayoutRouter(
    {
      create: CheckAll(
        CheckExtent,
        CheckSize,
        CheckHeightmapURLNotPresent,
      ),
      patch: CheckAll(CheckHeightmapURLPresent),
    },
    LayoutStore(),
  ),
  ImageRouter(ImageStore()),
)
app.listen(port, () => console.log(`0.0.0.0:${port}`))
