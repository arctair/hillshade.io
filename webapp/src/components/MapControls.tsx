import { MutableRefObject, useEffect, useRef } from 'react'
import {
  createPanAction,
  createResizeAction,
  createZoomAction,
  ViewStateAction,
} from './ViewState'

type MapControlsProps = {
  onEvent: (value: ViewStateAction) => void
}
export default function MapControls({ onEvent }: MapControlsProps) {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const lastPointerPositionRef = useRef() as MutableRefObject<
    [number, number] | undefined
  >

  useEffect(() => {
    function onResize() {
      onEvent(
        createResizeAction({
          mapSize: [ref.current.offsetWidth, ref.current.offsetHeight],
        }),
      )
    }
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [onEvent])

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
                lastPointerPositition[0] - pointerPosition[0],
                lastPointerPositition[1] - pointerPosition[1],
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
            pointerXY: [e.clientX, e.clientY],
          }),
        )
      }
    />
  )
}
