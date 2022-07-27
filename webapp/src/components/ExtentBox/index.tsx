import { MutableRefObject, useRef } from 'react'
import { useViewState } from '../ViewState'
import { useExtentBox } from './context'
import { selectBoxStyle } from './selectors'

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
          ...(state.rectangle
            ? selectBoxStyle(viewState, state.rectangle)
            : { visibility: 'hidden' }),
          border: '1px solid red',
          position: 'absolute',
        }}
      />
    </div>
  )
}
