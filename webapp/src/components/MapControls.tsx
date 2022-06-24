import { MutableRefObject, useEffect, useRef } from 'react'
import {
  createPanAction,
  createResizeAction,
  createZoomAction,
  ViewStateAction,
} from './ViewState'
import ZoomButtons from './ZoomButtons'

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
      style={{
        height: '100%',
        touchAction: 'none',
        display: 'grid',
        gridAutoColumns: '1fr auto',
      }}
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
      onWheel={(e) => {
        const { left, top } = ref.current.getBoundingClientRect()
        onEvent(
          createZoomAction({
            deltaZ: -e.deltaY / 114 / 4,
            pointerXY: [e.clientX - left, e.clientY - top],
          }),
        )
      }}
    >
      <div style={{ gridColumn: '2' }}>
        <ZoomButtons
          onZoom={(deltaZ) =>
            onEvent(
              createZoomAction({
                deltaZ,
                pointerXY: [
                  ref.current.offsetWidth / 2,
                  ref.current.offsetHeight / 2,
                ],
              }),
            )
          }
        />
      </div>
    </div>
  )
}
