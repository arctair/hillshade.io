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
  const isWorldScreenResolutionTooBig = selectWorldScreenResolution(
    layout,
  ).some((v) => v > 200)
  const isWorldScreenResolutionTooSmall = selectWorldScreenResolution(
    layout,
  ).some((v) => v < 10)
  return (
    <>
      <div style={{ fontWeight: 'bold' }}>layout</div>
      <LayoutSummary layout={layout} />
      <div style={{ fontWeight: 'bold' }}>
        remote layout&nbsp;
        <button
          disabled={isWorldScreenResolutionTooBig}
          onClick={() => createLayout()}
        >
          +
        </button>
        {remoteLayout && <button onClick={() => forgetLayout()}>-</button>}
      </div>
      {isWorldScreenResolutionTooBig && (
        <Error>
          World screen resolution is too big. Zoom in to create a new
          layout.
        </Error>
      )}
      {isWorldScreenResolutionTooSmall && (
        <Warning>
          World screen resolution is too small. You can still create a
          layout but it will appear pixelated.
        </Warning>
      )}
      {errors.map((error) => (
        <Error>{error}</Error>
      ))}
      <KeyedLayoutSummary layout={remoteLayout} />
    </>
  )
}

interface ErrorProps {
  children: React.ReactNode
}
function Error({ children }: ErrorProps) {
  return <div style={{ color: 'red' }} children={children} />
}

interface WarningProps {
  children: React.ReactNode
}
function Warning({ children }: WarningProps) {
  return <div style={{ color: '#970' }} children={children} />
}
