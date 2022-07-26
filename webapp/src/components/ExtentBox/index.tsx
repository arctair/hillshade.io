import { MutableRefObject, useRef } from 'react'
import { useExtentBox } from './context'
import { State } from './types'

export default function ExtentBox() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const [state, { pointerDown, pointerMove, pointerUp }] = useExtentBox()

  return (
    <div
      ref={ref}
      style={{
        height: '100%',
        position: 'relative',
      }}
      onPointerDown={(event) =>
        pointerDown({
          event,
          rect: ref.current.getBoundingClientRect(),
        })
      }
      onPointerMove={(event) =>
        pointerMove({
          event,
          rect: ref.current.getBoundingClientRect(),
        })
      }
      onPointerUp={pointerUp}
    >
      <div
        style={{
          ...selectStyle(state),
          border: '1px solid red',
          position: 'absolute',
        }}
      />
    </div>
  )
}

const selectStyle = ({ rectangle: [x0, y0, x1, y1] }: State) => {
  const left = Math.min(x0, x1)
  const top = Math.min(y0, y1)
  const right = Math.max(x0, x1)
  const bottom = Math.max(y0, y1)
  return {
    left: px(left),
    top: px(top),
    width: px(right - left),
    height: px(bottom - top),
  }
}

const px = (v: number) => `${v}px`
