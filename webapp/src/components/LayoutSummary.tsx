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
      {layout.attachments.heightmapURL && (
        <div>heightmap URL: {layout.attachments.heightmapURL}</div>
      )}
      {layout.attachments.heightmapPreviewURL && (
        <div>
          heightmap preview URL: {layout.attachments.heightmapPreviewURL}
        </div>
      )}
    </>
  ) : null
}
