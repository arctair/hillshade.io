import { useRemoteLayoutState } from './RemoteLayoutState'
import { useViewState } from './ViewState'

export default function RenderControls() {
  const [viewState] = useViewState()
  const [{ errors, layout }, { createLayout }] = useRemoteLayoutState()
  return (
    <>
      <div>
        {JSON.stringify({
          ...viewState,
          offset: viewState.offset.map((v) => v.toFixed(4)),
          zoom: viewState.zoom.toFixed(2),
        })}
      </div>
      <button onClick={() => createLayout()}>create</button>
      {errors.map((error) => (
        <div style={{ color: 'red' }}>{error}</div>
      ))}
      <div>{JSON.stringify(layout)}</div>
    </>
  )
}
