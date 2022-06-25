export interface Layout {
  size: [number, number]
  extent: [number, number, number, number]
  heightmapURL: string | undefined
}

export interface KeyedLayout extends Layout {
  key: string
}

export interface LayoutPatch {
  heightmapURL: string
}
