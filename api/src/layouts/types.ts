export interface Layout {
  size: [number, number]
  extent: {
    left: number
    top: number
    right: number
    bottom: number
  }
}

export interface KeyedLayout extends Layout {
  key: string
}
