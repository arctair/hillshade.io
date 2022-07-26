import React from 'react'
import BaseMap from './BaseMap'
import ExtentBox from './ExtentBox'
import { useExtentBox } from './ExtentBox/context'
import { selectActive } from './ExtentBox/selectors'
import { useRemoteLayoutState } from './RemoteLayoutState'
import { useViewState } from './ViewState'
import ViewStateControls from './ViewStateControls'

export default function Cartograph() {
  const [{ layout }] = useRemoteLayoutState()
  const heightmapURL = layout?.attachments.heightmapPreviewURL

  const dispatch = useViewState()[1]
  const [state] = useExtentBox()

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <Layer>
        <BaseMap />
      </Layer>
      <Layer>
        <img src={heightmapURL} alt="" />
      </Layer>
      <Layer>
        <ViewStateControls onEvent={dispatch} />
      </Layer>
      <Layer enablePointerEvents={selectActive(state)}>
        <ExtentBox />
      </Layer>
    </div>
  )
}

interface LayerProps {
  children: React.ReactNode
  enablePointerEvents?: boolean
}
function Layer({ children, enablePointerEvents = true }: LayerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        pointerEvents: enablePointerEvents ? 'auto' : 'none',
      }}
      children={children}
    />
  )
}
