import { MutableRefObject, useRef } from 'react'
import {
  createPanAction,
  createZoomAction,
  PanAction,
  ZoomAction,
} from './ViewState'

type MapControlsProps = {
  dispatch: React.Dispatch<PanAction | ZoomAction>
}
export default function MapControls({ dispatch }: MapControlsProps) {
  const lastPointerPositionRef = useRef() as MutableRefObject<
    [number, number] | undefined
  >

  return (
    <div
      style={{ height: '100%', touchAction: 'none' }}
      onPointerDown={(e) => {
        lastPointerPositionRef.current = [e.clientX, e.clientY]
      }}
      onPointerMove={(e) => {
        if (lastPointerPositionRef.current) {
          const lastPointerPositition = lastPointerPositionRef.current
          const pointerPosition: [number, number] = [e.clientX, e.clientY]
          const [dx, dy] = [
            (lastPointerPositition[0] - pointerPosition[0]) / 256,
            (lastPointerPositition[1] - pointerPosition[1]) / 256,
          ]
          dispatch(createPanAction([dx, dy]))

          lastPointerPositionRef.current = pointerPosition
        }
      }}
      onPointerUp={() => {
        lastPointerPositionRef.current = undefined
      }}
      onWheel={(e) => dispatch(createZoomAction(-e.deltaY / 114 / 4))}
    />
  )
}
