import { v4 as uuidv4 } from 'uuid'
import { KeyedLayout, Layout, LayoutPatch } from './types'

export const errKeyNotFound = 'This key is not present'

export type Store = {
  getAll: () => { layouts: KeyedLayout[] }
  get: (key: string) => [KeyedLayout?, string?]
  create: (layout: Layout) => KeyedLayout
  patch: (id: string, patch: LayoutPatch) => [KeyedLayout?, string?]
}

export function Store(): Store {
  const layouts = new Map<string, KeyedLayout>()
  return {
    getAll: () => ({ layouts: Array.from(layouts.values()) }),
    get: (key) =>
      layouts.has(key)
        ? [layouts.get(key), undefined]
        : [undefined, errKeyNotFound],
    create: (layout) => {
      const key = uuidv4()
      const keyedLayout = { ...layout, key, attachments: new Map() }
      layouts.set(key, keyedLayout)
      return keyedLayout
    },
    patch: (key, patch) => {
      if (layouts.has(key)) {
        const layout = layouts.get(key)!
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
