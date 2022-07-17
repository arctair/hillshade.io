import { KeyedLayout, Layout, selectWorldScreenResolution } from './types'

interface LayoutSummaryProps {
  layout: Layout
}
export function LayoutSummary({ layout }: LayoutSummaryProps) {
  const worldScreenResolution = selectWorldScreenResolution(layout)
    .map((v) => v.toFixed(2))
    .join('x')
  return (
    <>
      <div>width: {layout.size[0]}</div>
      <div>height: {layout.size[1]}</div>
      <div>extent: [ {layout.extent.join(' ')} ] (EPSG:3857)</div>
      <div>
        world screen resolution: {worldScreenResolution} meters/pixel
      </div>
    </>
  )
}

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
