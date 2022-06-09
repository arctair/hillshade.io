import {
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import MapControls from './MapControls'
import { defaultViewState, viewStateReducer } from './ViewState'

// eslint-disable-next-line
const mat4 = require('gl-mat4')

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>

  // eslint-disable-next-line
  const [error, setError] = useState('')
  // eslint-disable-next-line
  const [viewState, dispatch] = useReducer(
    viewStateReducer,
    defaultViewState,
  )

  useEffect(() => {
    const cartographWebGL = new CartographWebGL(canvasRef.current)
    return () => cartographWebGL.teardown()
  }, [])

  return (
    <div style={{ height: '100%', position: 'relative' }} ref={ref}>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        <MapControls onEvent={dispatch} />
      </div>
      <canvas
        style={{
          position: 'absolute',
          height: '100%',
        }}
        ref={canvasRef}
      />
      <span
        style={{
          color: '#E00',
          position: 'absolute',
          padding: '0 0.25rem',
        }}
      >
        {error}
      </span>
    </div>
  )
}

class CartographWebGL {
  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl')
    if (gl === null) {
      throw Error(
        `Unable to initialize WebGL. Your browser or machine may not support it.`,
      )
    }
    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  teardown() {}
}
