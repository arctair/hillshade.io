import { v4 as uuidv4 } from 'uuid'

export type LayoutService = {
  getAll: () => { layouts: KeyedLayout[] }
  create: (layout: Layout) => KeyedLayout
}

export interface Layout {
  size: [number, number]
}

export interface KeyedLayout extends Layout {
  key: string
}

export function createLayoutService(): LayoutService {
  const layouts = new Array<KeyedLayout>()
  return {
    getAll: () => ({ layouts }),
    create: (layout) => {
      const key = uuidv4()
      const keyedLayout = { key, ...layout }
      layouts.push(keyedLayout)
      return keyedLayout
    },
  }
}
