import { v4 as uuidv4 } from 'uuid'
import { KeyedLayout, Layout } from './types'

export type Store = {
  getAll: () => { layouts: KeyedLayout[] }
  create: (layout: Layout) => KeyedLayout
}

export function createStore(): Store {
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
