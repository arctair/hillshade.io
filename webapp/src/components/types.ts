export interface Layout {
  size: [number, number]
  extent: [number, number, number, number]
}
export interface KeyedLayout extends Layout {
  key: string
}
