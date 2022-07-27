import { selectBoxStyle } from './ExtentBox/selectors'
import { useRemoteLayoutState } from './RemoteLayoutState'
import { EPSG_3857_TO_TILE, transformExtent } from './transformations'
import { useViewState } from './ViewState'

export default function Preview() {
  const [viewState] = useViewState()
  const [{ layout }] = useRemoteLayoutState()
  if (!layout) {
    return null
  } else {
    const heightmapURL = layout.attachments.heightmapPreviewURL
    const extent = transformExtent(layout.extent, EPSG_3857_TO_TILE)

    return (
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <img
          style={{
            position: 'absolute',
            ...selectBoxStyle(viewState, extent),
          }}
          src={heightmapURL}
          alt=""
        />
      </div>
    )
  }
}
