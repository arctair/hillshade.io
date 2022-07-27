import { CSSProperties, MutableRefObject, useRef } from 'react'
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
  state: State,
  { offset: [x, y], zoom }: ViewState,
): CSSProperties => {
  if (!state.rectangle) return { visibility: 'hidden' }
  const [x0, y0, x1, y1] = state.rectangle
  const scale = Math.pow(2, zoom)
  const left = (x0 - x) * 256 * scale
  const bottom = (y0 - y) * 256 * scale
  const right = (x1 - x) * 256 * scale
  const top = (y1 - y) * 256 * scale
  return {
    left: px(left),
    top: px(top),
    width: px(right - left),
    height: px(bottom - top),
  }
}

const px = (v: number) => `${v}px`
