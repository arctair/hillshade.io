export interface Layout {
  size: [number, number]
  extent: [number, number, number, number]
  heightmapURL: string | undefined
  attachments: Map<string, string>
}

export interface KeyedLayout extends Layout {
  key: string
}

export interface LayoutPatch {
  heightmapURL: string
  attachments: Map<string, string>
}
