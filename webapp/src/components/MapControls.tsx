import { MutableRefObject, useRef } from 'react'

type MapControlsProps = {
  onPan: (delta: [number, number]) => void
  onZoom: (dz: number) => void
}
export default function MapControls({ onPan, onZoom }: MapControlsProps) {
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
            ((lastPointerPositition[0] - pointerPosition[0]) / 256) *
              window.devicePixelRatio,
            ((lastPointerPositition[1] - pointerPosition[1]) / 256) *
              window.devicePixelRatio,
          ]
          onPan([dx, dy])

          lastPointerPositionRef.current = pointerPosition
        }
      }}
      onPointerUp={() => {
        lastPointerPositionRef.current = undefined
      }}
      onWheel={(e) => onZoom(-e.deltaY / 114 / 4)}
    />
  )
}
