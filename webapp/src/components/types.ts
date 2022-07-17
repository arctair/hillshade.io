export interface Layout {
  size: [number, number]
  extent: [number, number, number, number]
}

export const selectWorldScreenResolution = (layout: Layout) => [
  (layout.extent[2] - layout.extent[0]) / layout.size[0],
  (layout.extent[3] - layout.extent[1]) / layout.size[1],
]
export interface KeyedLayout extends Layout {
  key: string
  attachments: { heightmapURL: string; heightmapPreviewURL: string }
}
