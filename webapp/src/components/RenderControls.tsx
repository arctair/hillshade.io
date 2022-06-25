import { useRemoteLayoutState } from './RemoteLayoutState'
import { TILE_TO_EPSG_3857, transformExtent } from './transformations'
import { KeyedLayout, Layout } from './types'
import { selectLayout, useViewState } from './ViewState'

export default function RenderControls() {
  const [viewState] = useViewState()
  const [{ errors, layout: remoteLayout }, { createLayout }] =
    useRemoteLayoutState()
  const layout = selectLayout(viewState)
  layout.extent = transformExtent(layout.extent, TILE_TO_EPSG_3857)
  return (
    <>
      <div style={{ fontWeight: 'bold' }}>layout</div>
      <LayoutSummary layout={layout} />
      <div style={{ fontWeight: 'bold' }}>
        remote layout&nbsp;
        <button onClick={() => createLayout()}>+</button>
      </div>
      {errors.map((error) => (
        <div style={{ color: 'red' }}>{error}</div>
      ))}
      <KeyedLayoutSummary layout={remoteLayout} />
    </>
  )
}

interface LayoutSummaryProps {
  layout: Layout
}
function LayoutSummary({ layout }: LayoutSummaryProps) {
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
function KeyedLayoutSummary({ layout }: KeyedLayoutSummaryProps) {
  return layout ? (
    <>
      <div>key: {layout.key}</div>
      <LayoutSummary layout={layout} />
      {layout.heightmapURL && (
        <div>heightmap URL: {layout.heightmapURL}</div>
      )}
    </>
  ) : null
}
