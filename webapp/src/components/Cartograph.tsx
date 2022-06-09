import {
  MutableRefObject,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import MapControls from './MapControls'
import {
  defaultViewState,
  selectExtent,
  viewStateReducer,
} from './ViewState'

const mat4 = require('gl-mat4')

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>
  const matricesRef = useRef({
    modelViewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
  })

  const [error, setError] = useState('')
  const [viewState, dispatch] = useReducer(
    viewStateReducer,
    defaultViewState,
  )

  useEffect(() => {
    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6])
    matricesRef.current.modelViewMatrix = modelViewMatrix
  }, [])

  useEffect(() => {
    const projectionMatrix = mat4.create()
    mat4.ortho(projectionMatrix, ...selectExtent(viewState), 0.1, 100.0)
    matricesRef.current.projectionMatrix = projectionMatrix
  }, [viewState])

  useEffect(() => {
    const canvas = canvasRef.current
    const matrices = matricesRef.current
    if (viewState.mapSize[0] <= 1) return
    canvas.width = viewState.mapSize[0]
    canvas.height = viewState.mapSize[1]

    const cartographWebGL = new CartographWebGL(canvas, matrices, setError)
    function animationFrame() {
      cartographWebGL.animationFrame()
      requestAnimationFrame(animationFrame)
    }
    animationFrame()
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

interface CartographWebGLContext {
  aVertexColorLocation: number
  aVertexPositionLocation: number
  colorBuffer: WebGLBuffer
  matrices: { modelViewMatrix: any; projectionMatrix: any }
  gl: WebGLRenderingContext
  positionBuffer: WebGLBuffer
  program: WebGLProgram
  uModelViewMatrix: WebGLUniformLocation
  uProjectionMatrixLocation: WebGLUniformLocation
}

class CartographWebGL {
  context?: CartographWebGLContext
  constructor(
    canvas: HTMLCanvasElement,
    matrices: { modelViewMatrix: any; projectionMatrix: any },
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
      this.context = this.initializeContext(gl, matrices)
    } catch (error) {
      onError((error as Error).message)
    }
  }

  initializeContext(
    gl: WebGLRenderingContext,
    matrices: { modelViewMatrix: any; projectionMatrix: any },
  ) {
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      ` attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying lowp vec4 vColor;

        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vColor = aVertexColor;
        }`,
    )

    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      ` varying lowp vec4 vColor;

        void main() {
          gl_FragColor = vColor;
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
    const aVertexColorLocation = gl.getAttribLocation(
      program,
      'aVertexColor',
    )
    const uProjectionMatrixLocation = gl.getUniformLocation(
      program,
      'uProjectionMatrix',
    )
    const uModelViewMatrix = gl.getUniformLocation(
      program,
      'uModelViewMatrix',
    )

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
          [1.0, 1.0],
          [0.0, 1.0],
          [1.0, 0.0],
          [0.0, 0.0],
        ].flat(),
      ),
      gl.STATIC_DRAW,
    )

    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [
          [1.0, 1.0, 1.0, 1.0],
          [1.0, 0.0, 0.0, 1.0],
          [0.0, 1.0, 0.0, 1.0],
          [0.0, 0.0, 1.0, 1.0],
        ].flat(),
      ),
      gl.STATIC_DRAW,
    )

    return {
      aVertexColorLocation,
      aVertexPositionLocation,
      colorBuffer,
      gl,
      matrices,
      positionBuffer,
      program,
      uModelViewMatrix,
      uProjectionMatrixLocation,
    } as CartographWebGLContext
  }

  animationFrame() {
    if (!this.context) throw Error('Context has not been initialized')

    const {
      aVertexColorLocation,
      aVertexPositionLocation,
      colorBuffer,
      gl,
      matrices: { modelViewMatrix, projectionMatrix },
      positionBuffer,
      program,
      uModelViewMatrix,
      uProjectionMatrixLocation,
    } = this.context

    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.vertexAttribPointer(
      aVertexPositionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )
    gl.enableVertexAttribArray(aVertexPositionLocation)

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.vertexAttribPointer(aVertexColorLocation, 4, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(aVertexColorLocation)

    gl.useProgram(program)

    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix)
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
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
