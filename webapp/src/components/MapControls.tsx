import { MutableRefObject, useRef } from 'react'
import {
  createPanAction,
  createZoomAction,
  PanAction,
  ZoomAction,
} from './ViewState'

type MapControlsProps = {
  onEvent: (value: PanAction | ZoomAction) => void
}
export default function MapControls({ onEvent }: MapControlsProps) {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const lastPointerPositionRef = useRef() as MutableRefObject<
    [number, number] | undefined
  >

  return (
    <div
      ref={ref}
      style={{ height: '100%', touchAction: 'none' }}
      onPointerDown={(e) => {
        lastPointerPositionRef.current = [e.clientX, e.clientY]
      }}
      onPointerMove={(e) => {
        if (lastPointerPositionRef.current) {
          const lastPointerPositition = lastPointerPositionRef.current
          const pointerPosition: [number, number] = [e.clientX, e.clientY]

          onEvent(
            createPanAction({
              deltaXY: [
                (lastPointerPositition[0] - pointerPosition[0]) / 256,
                (lastPointerPositition[1] - pointerPosition[1]) / 256,
              ],
            }),
          )

          lastPointerPositionRef.current = pointerPosition
        }
      }}
      onPointerUp={() => {
        lastPointerPositionRef.current = undefined
      }}
      onWheel={(e) =>
        onEvent(
          createZoomAction({
            deltaZ: -e.deltaY / 114 / 4,
            mapSize: [ref.current.offsetWidth, ref.current.offsetWidth],
            pointerXY: [e.clientX, e.clientY],
          }),
        )
      }
    />
  )
}
