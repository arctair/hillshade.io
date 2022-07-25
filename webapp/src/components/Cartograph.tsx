import React from 'react'
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
      <Layer>
        <BaseMap />
      </Layer>
      <Layer>
        <img src={heightmapURL} alt="" />
      </Layer>
      <Layer>
        <ViewStateControls onEvent={dispatch} />
      </Layer>
    </div>
  )
}

interface LayerProps {
  children: React.ReactNode
}
function Layer({ children }: LayerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
      children={children}
    />
  )
}
