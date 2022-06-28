import { useRemoteLayoutState } from './RemoteLayoutState'
import { TILE_TO_EPSG_3857, transformExtent } from './transformations'
import { selectLayout, useViewState } from './ViewState'
import { LayoutSummary, KeyedLayoutSummary } from './LayoutSummary'

export default function RenderControls() {
  const [viewState] = useViewState()
  const [
    { errors, layout: remoteLayout },
    { createLayout, forgetLayout },
  ] = useRemoteLayoutState()
  const layout = selectLayout(viewState)
  layout.extent = transformExtent(layout.extent, TILE_TO_EPSG_3857)
  return (
    <>
      <div style={{ fontWeight: 'bold' }}>layout</div>
      <LayoutSummary layout={layout} />
      <div style={{ fontWeight: 'bold' }}>
        remote layout&nbsp;
        <button onClick={() => createLayout()}>+</button>
        {remoteLayout && <button onClick={() => forgetLayout()}>-</button>}
      </div>
      {errors.map((error) => (
        <div style={{ color: 'red' }}>{error}</div>
      ))}
      <KeyedLayoutSummary layout={remoteLayout} />
    </>
  )
}
