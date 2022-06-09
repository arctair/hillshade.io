import {
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import MapControls from './MapControls'
import { defaultViewState, viewStateReducer } from './ViewState'

const mat4 = require('gl-mat4')

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>

  const [error, setError] = useState('')
  const [viewState, dispatch] = useReducer(
    viewStateReducer,
    defaultViewState,
  )

  useEffect(() => {
    canvasRef.current.width = viewState.mapSize[0]
    canvasRef.current.height = viewState.mapSize[1]
    if (viewState.mapSize[0] <= 1) return
    const cartographWebGL = new CartographWebGL(
      canvasRef.current,
      setError,
    )
    return () => cartographWebGL.teardown()
  }, [viewState.mapSize])

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
  constructor(
    canvas: HTMLCanvasElement,
    onError: (message: string) => void,
  ) {
    const gl = canvas.getContext('webgl')
    if (gl === null) {
      onError(
        `Unable to initialize WebGL. Your browser or machine may not support it.`,
      )
      return
    }

    try {
      this.initialize(gl)
    } catch (error) {
      onError((error as Error).message)
    }
  }

  initialize(gl: WebGLRenderingContext) {
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      ` attribute vec4 aVertexPosition;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }`,
    )

    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      ` void main() {
          gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }`,
    )

    const program = gl.createProgram()!
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const programInfoLog = gl.getProgramInfoLog(program)
      const message = `Unable to initialize the shader program: ${programInfoLog}`
      throw Error(message)
    }

    const aVertexPositionLocation = gl.getAttribLocation(
      program,
      'aVertexPosition',
    )
    const uProjectionMatrixLocation = gl.getUniformLocation(
      program,
      'uProjectionMatrix',
    )
    const uModelViewMatrix = gl.getUniformLocation(
      program,
      'uModelViewMatrix',
    )

    const positionsBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
          [1.0, 1.0],
          [-1.0, 1.0],
          [1.0, -1.0],
          [-1.0, -1.0],
        ].flat(),
      ),
      gl.STATIC_DRAW,
    )

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const projectionMatrix = mat4.create()
    mat4.perspective(
      projectionMatrix,
      (45 * Math.PI) / 180,
      gl.canvas.clientWidth / gl.canvas.clientHeight,
      0.1,
      100.0,
    )

    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0, 0, -6])

    gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer)
    gl.vertexAttribPointer(
      aVertexPositionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )
    gl.enableVertexAttribArray(aVertexPositionLocation)

    gl.useProgram(program)

    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix)
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  teardown() {}
}

function createShader(
  gl: WebGLRenderingContext,
  type: GLenum,
  shaderSource: string,
) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, shaderSource)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderInfoLog = gl.getShaderInfoLog(shader)
    const message = `An error occurred compiling the shaders: ${shaderInfoLog}`
    gl.deleteShader(shader)
    throw Error(message)
  }

  return shader
}
