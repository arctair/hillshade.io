import { MutableRefObject, useRef } from 'react'
import ViewState, { useViewState } from '../ViewState'
import { useExtentBox } from './context'
import { State } from './types'

export default function ExtentBox() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const [state, { pointerDown, pointerMove, pointerUp }] = useExtentBox()
  const [viewState] = useViewState()

  return (
    <div
      ref={ref}
      style={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      onPointerDown={({ clientX, clientY }) => {
        const { x, y } = ref.current.getBoundingClientRect()
        pointerDown({
          position: [clientX - x, clientY - y],
          viewState,
        })
      }}
      onPointerMove={({ clientX, clientY }) => {
        const { x, y } = ref.current.getBoundingClientRect()
        pointerMove({
          position: [clientX - x, clientY - y],
          viewState,
        })
      }}
      onPointerUp={pointerUp}
    >
      <div
        style={{
          ...selectStyle(state, viewState),
          border: '1px solid red',
          position: 'absolute',
        }}
      />
    </div>
  )
}

const selectStyle = (
  { rectangle: [x0, y0, x1, y1] }: State,
  { offset: [x, y], zoom }: ViewState,
) => {
  const scale = Math.pow(2, zoom)
  const left = (Math.min(x0, x1) - x) * 256 * scale
  const top = (Math.min(y0, y1) - y) * 256 * scale
  const right = (Math.max(x0, x1) - x) * 256 * scale
  const bottom = (Math.max(y0, y1) - y) * 256 * scale
  return {
    left: px(left),
    top: px(top),
    width: px(right - left),
    height: px(bottom - top),
  }
}

const px = (v: number) => `${v}px`
