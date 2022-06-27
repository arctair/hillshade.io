import { v4 as uuidv4 } from 'uuid'
import { KeyedLayout, Layout, LayoutPatch } from './types'

export const errNoLayoutWithKey = 'This key is not present'

export type Store = {
  getAll: () => { layouts: KeyedLayout[] }
  create: (layout: Layout) => KeyedLayout
  patch: (id: string, patch: LayoutPatch) => [KeyedLayout?, string?]
}

export function Store(): Store {
  const layouts = new Array<KeyedLayout>()
  return {
    getAll: () => ({ layouts }),
    create: (layout) => {
      const key = uuidv4()
      const keyedLayout = { key, ...layout }
      layouts.push(keyedLayout)
      return keyedLayout
    },
    patch: (key, patch) => {
      try {
        const layout = layouts.find((v) => v.key === key)
        if (layout) {
          layout.heightmapURL = patch.heightmapURL
          return [layout, undefined]
        } else {
          return [undefined, errNoLayoutWithKey]
        }
      } catch (e) {
        return [undefined, (e as Error).message]
      }
    },
  }
}
