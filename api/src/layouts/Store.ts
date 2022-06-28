import { v4 as uuidv4 } from 'uuid'
import { KeyedLayout, Layout, LayoutPatch } from './types'

export const errKeyNotFound = 'This key is not present'

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
      const keyedLayout = { ...layout, key, attachments: new Map() }
      layouts.push(keyedLayout)
      return keyedLayout
    },
    patch: (key, patch) => {
      const layout = layouts.find((v) => v.key === key)
      if (layout) {
        if (patch.heightmapURL) layout.heightmapURL = patch.heightmapURL
        patch.attachments?.forEach((value, key) =>
          layout.attachments.set(key, value),
        )
        return [layout, undefined]
      } else {
        return [undefined, errKeyNotFound]
      }
    },
  }
}
