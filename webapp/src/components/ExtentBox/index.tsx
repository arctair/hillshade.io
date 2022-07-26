import { MutableRefObject, useContext, useRef } from 'react'
import { context } from './context'
import { State } from './types'

export default function ExtentBox() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const [extent, dispatch] = useContext(context)

  return (
    <div
      ref={ref}
      style={{ height: '100%', position: 'relative' }}
      onPointerDown={(event) =>
        dispatch({
          event,
          rect: ref.current.getBoundingClientRect(),
          type: 'onPointerDown',
        })
      }
      onPointerMove={(event) =>
        dispatch({
          event,
          rect: ref.current.getBoundingClientRect(),
          type: 'onPointerMove',
        })
      }
      onPointerUp={() => dispatch({ type: 'onPointerUp' })}
    >
      <div
        style={{
          ...selectStyle(extent),
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
