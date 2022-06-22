export interface Layout {
  size: [number, number]
  extent: {
    left: number
    top: number
    right: number
    bottom: number
  }
  heightmapURL: string | undefined
}

export interface KeyedLayout extends Layout {
  key: string
}
