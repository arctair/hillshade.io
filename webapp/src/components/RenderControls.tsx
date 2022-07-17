import { useRemoteLayoutState } from './RemoteLayoutState'
import { TILE_TO_EPSG_3857, transformExtent } from './transformations'
import { selectLayout, useViewState } from './ViewState'
import { LayoutSummary, KeyedLayoutSummary } from './LayoutSummary'
import { selectWorldScreenResolution } from './types'

export default function RenderControls() {
  const [viewState] = useViewState()
  const [
    { errors, layout: remoteLayout },
    { createLayout, forgetLayout },
  ] = useRemoteLayoutState()
  const layout = selectLayout(viewState)
  layout.extent = transformExtent(layout.extent, TILE_TO_EPSG_3857)
  const worldScreenResolutionTooBig = selectWorldScreenResolution(
    layout,
  ).some((v) => v > 200)
  return (
    <>
      <div style={{ fontWeight: 'bold' }}>layout</div>
      <LayoutSummary layout={layout} />
      <div style={{ fontWeight: 'bold' }}>
        remote layout&nbsp;
        <button
          disabled={worldScreenResolutionTooBig}
          onClick={() => createLayout()}
        >
          +
        </button>
        {remoteLayout && <button onClick={() => forgetLayout()}>-</button>}
      </div>
      {worldScreenResolutionTooBig && (
        <div style={{ color: 'red' }}>
          World screen resolution is too big. Zoom in to create a new
          layout.
        </div>
      )}
      {errors.map((error) => (
        <div style={{ color: 'red' }}>{error}</div>
      ))}
      <KeyedLayoutSummary layout={remoteLayout} />
    </>
  )
}
