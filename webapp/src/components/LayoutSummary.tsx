import { useRemoteLayoutState } from './RemoteLayoutState'
import { TILE_TO_EPSG_3857, transformExtent } from './transformations'
import { KeyedLayout, Layout } from './types'
import { selectLayout, useViewState } from './ViewState'

interface LayoutSummaryProps {
  layout: Layout
}
export function LayoutSummary({ layout }: LayoutSummaryProps) {
  return (
    <>
      <div>width: {layout.size[0]}</div>
      <div>height: {layout.size[1]}</div>
      <div>extent: [ {layout.extent.join(' ')} ] (EPSG:3857)</div>
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
