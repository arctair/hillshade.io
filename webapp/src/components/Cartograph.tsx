import BaseMap from './BaseMap'
import { useRemoteLayoutState } from './RemoteLayoutState'
import { useViewState } from './ViewState'
import ViewStateControls from './ViewStateControls'

export default function Cartograph() {
  const [{ layout }] = useRemoteLayoutState()
  const heightmapURL = layout?.attachments.heightmapPreviewURL

  const dispatch = useViewState()[1]

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <BaseMap />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <img src={heightmapURL} alt="" />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <ViewStateControls onEvent={dispatch} />
      </div>
    </div>
  )
}
