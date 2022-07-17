import { KeyedLayout, Layout } from './types'

interface LayoutSummaryProps {
  layout: Layout
}
export function LayoutSummary({ layout }: LayoutSummaryProps) {
  const [horizontalResolution, verticalResolution] = selectResolution(
    layout,
  ).map((v) => v.toFixed(2))
  return (
    <>
      <div>width: {layout.size[0]}</div>
      <div>height: {layout.size[1]}</div>
      <div>extent: [ {layout.extent.join(' ')} ] (EPSG:3857)</div>
      <div>
        resolution: {horizontalResolution}x{verticalResolution}{' '}
        meters/pixel
      </div>
    </>
  )
}

const selectResolution = (layout: Layout) => [
  (layout.extent[2] - layout.extent[0]) / layout.size[0],
  (layout.extent[3] - layout.extent[1]) / layout.size[1],
]
interface KeyedLayoutSummaryProps {
  layout?: KeyedLayout
}
export function KeyedLayoutSummary({ layout }: KeyedLayoutSummaryProps) {
  return layout ? (
    <>
      <div>key: {layout.key}</div>
      <LayoutSummary layout={layout} />
      <a
        style={{
          display: 'block',
          visibility: layout.attachments.heightmapURL
            ? 'visible'
            : 'hidden',
        }}
        href={layout.attachments.heightmapURL}
      >
        heightmap
      </a>
      <a
        style={{
          display: 'block',
          visibility: layout.attachments.heightmapPreviewURL
            ? 'visible'
            : 'hidden',
        }}
        href={layout.attachments.heightmapPreviewURL}
      >
        preview
      </a>
    </>
  ) : null
}
