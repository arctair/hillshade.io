import { MutableRefObject, useReducer, useRef } from 'react'

type State = {
  dragging: boolean
  rectangle: [number, number, number, number]
}
const defaultState = { dragging: false, rectangle: [0, 0, 0, 0] } as State

export default function ExtentBox() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const [extent, dispatch] = useReducer(reducer, defaultState)

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

function reducer(state: State, { event, rect, type }: any): State {
  if (type === 'onPointerDown') {
    const x = event.clientX - rect.x
    const y = event.clientY - rect.y
    return { dragging: true, rectangle: [x, y, x, y] }
  } else if (type === 'onPointerMove') {
    const {
      dragging,
      rectangle: [x0, y0],
    } = state
    if (dragging) {
      const x = event.clientX - rect.x
      const y = event.clientY - rect.y
      return { ...state, rectangle: [x0, y0, x, y] }
    } else return state
  } else if (type === 'onPointerUp') {
    return { ...state, dragging: false }
  } else throw Error(`irreducible action type: ${type}`)
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
