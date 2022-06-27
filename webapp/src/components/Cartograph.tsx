import { MutableRefObject, useEffect, useRef, useState } from 'react'
import MapControls from './MapControls'
import { useRemoteLayoutState } from './RemoteLayoutState'
import {
  selectGLExtent2D,
  selectTileExtent2D,
  useViewState,
} from './ViewState'

const mat4 = require('gl-mat4')

interface Context {
  modelViewMatrix: any
  projectionMatrix: any
  tiles: Array<{ url?: string }>
  tileColumnCount: number
  tileRowCount: number
  tileGridVersion: number
}

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>
  const contextRef = useRef<Context>({
    modelViewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
    tiles: [],
    tileRowCount: 0,
    tileColumnCount: 0,
    tileGridVersion: 0,
  })
  const [{ layout }] = useRemoteLayoutState()
  const heightmapURL = layout?.heightmapURL

  const [error, setError] = useState('')
  const [viewState, dispatch] = useViewState()

  useEffect(() => {
    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6])
    contextRef.current.modelViewMatrix = modelViewMatrix
  }, [])

  useEffect(() => {
    const context = contextRef.current

    const projectionMatrix = mat4.create()
    const extent = selectGLExtent2D(viewState)
    mat4.ortho(projectionMatrix, ...extent, 0.1, 100.0)
    context.projectionMatrix = projectionMatrix

    const tiles = []
    let [left, right, bottom, top] = selectTileExtent2D(viewState)
    const z = Math.floor(viewState.zoom)
    const tileCount = Math.pow(2, z)
    for (let x = left; x < right; x++) {
      for (let y = top; y < bottom; y++) {
        const isInBounds =
          x >= 0 && x < tileCount && y >= 0 && y < tileCount && z < 23
        tiles.push({
          url: isInBounds
            ? `https://mt0.google.com/vt/lyrs=y&hl=en&x=${x}&y=${y}&z=${z}`
            : undefined,
        })
      }
    }
    context.tiles = tiles

    const tileColumnCount = Math.ceil(right - left)
    const tileRowCount = Math.ceil(bottom - top)
    if (
      tileColumnCount !== context.tileColumnCount ||
      tileRowCount !== context.tileRowCount
    ) {
      context.tileGridVersion++
      context.tileColumnCount = tileColumnCount
      context.tileRowCount = tileRowCount
    }
  }, [viewState])

  useEffect(() => {
    const canvas = canvasRef.current
    const [width, height] = viewState.mapSize
    canvas
      .getContext('webgl')
      ?.viewport(0, 0, (canvas.width = width), (canvas.height = height))
  }, [viewState.mapSize])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = contextRef.current
    const cartographWebGL = new CartographWebGL(canvas, context, setError)
    let lastTileGridVersion = 0
    let animationFrame: number
    function doAnimationFrame() {
      if (lastTileGridVersion !== context.tileGridVersion) {
        cartographWebGL.loadBuffers()
        lastTileGridVersion = context.tileGridVersion
      }
      cartographWebGL.animationFrame()
      animationFrame = requestAnimationFrame(doAnimationFrame)
    }
    doAnimationFrame()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div style={{ height: '100%', position: 'relative' }} ref={ref}>
      <canvas
        style={{
          position: 'absolute',
          height: '100%',
        }}
        ref={canvasRef}
      />
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <img src={heightmapURL} alt="" />
      </div>
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
      >
        <MapControls onEvent={dispatch} />
      </div>
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

interface CartographWebGLFields {
  aTextureCoordinateLocation: number
  aVertexPositionLocation: number
  context: Context
  gl: WebGLRenderingContext
  indexBuffer: WebGLBuffer
  positionBuffer: WebGLBuffer
  program: WebGLProgram
  textureCoordinateBuffer: WebGLBuffer
  texturesByURL: Map<String, WebGLTexture>
  uModelViewMatrixLocation: WebGLUniformLocation
  uProjectionMatrixLocation: WebGLUniformLocation
  uSamplerLocation: WebGLUniformLocation
}

class CartographWebGL {
  fields?: CartographWebGLFields
  constructor(
    canvas: HTMLCanvasElement,
    context: Context,
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
      this.fields = this.initializeFields(gl, context)
    } catch (error) {
      onError((error as Error).message)
    }
  }

  initializeFields(gl: WebGLRenderingContext, context: Context) {
    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      ` attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoordinate;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoordinate;

        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
          vTextureCoordinate = aTextureCoordinate;
        }`,
    )

    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      ` varying highp vec2 vTextureCoordinate;
        
        uniform sampler2D uSampler;

        void main() {
          gl_FragColor = texture2D(uSampler, vTextureCoordinate);
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
    const aTextureCoordinateLocation = gl.getAttribLocation(
      program,
      'aTextureCoordinate',
    )
    const uProjectionMatrixLocation = gl.getUniformLocation(
      program,
      'uProjectionMatrix',
    )
    const uModelViewMatrixLocation = gl.getUniformLocation(
      program,
      'uModelViewMatrix',
    )
    const uSamplerLocation = gl.getUniformLocation(program, 'uSampler')

    const positionBuffer = gl.createBuffer()
    const textureCoordinateBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    return {
      aTextureCoordinateLocation,
      aVertexPositionLocation,
      context,
      gl,
      indexBuffer,
      positionBuffer,
      program,
      textureCoordinateBuffer,
      texturesByURL: new Map(),
      uModelViewMatrixLocation,
      uProjectionMatrixLocation,
      uSamplerLocation,
    } as CartographWebGLFields
  }

  loadBuffers() {
    const { gl, indexBuffer, positionBuffer, textureCoordinateBuffer } =
      this.fields!
    let positions = new Array<number>()
    let textureCoordinates = new Array<number>()
    let indices = new Array<number>()
    for (let left = 0; left < gl.canvas.width / 256 + 1; left++) {
      for (let top = 0; top < gl.canvas.height / 256 + 1; top++) {
        const index = positions.length / 2
        positions = positions.concat(
          [left + 1, top + 1],
          [left, top + 1],
          [left + 1, top],
          [left, top],
        )
        textureCoordinates = textureCoordinates.concat(
          [1.0, 1.0],
          [0.0, 1.0],
          [1.0, 0.0],
          [0.0, 0.0],
        )
        indices = indices.concat(
          index,
          index + 1,
          index + 2,
          index + 1,
          index + 3,
          index + 2,
        )
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW,
    )

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(textureCoordinates),
      gl.STATIC_DRAW,
    )

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    )
  }

  animationFrame() {
    if (!this.fields) return

    const {
      aTextureCoordinateLocation,
      aVertexPositionLocation,
      textureCoordinateBuffer,
      context: { modelViewMatrix, projectionMatrix, tiles },
      gl,
      indexBuffer,
      positionBuffer,
      program,
      texturesByURL,
      uModelViewMatrixLocation,
      uProjectionMatrixLocation,
      uSamplerLocation,
    } = this.fields

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

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordinateBuffer)
    gl.vertexAttribPointer(
      aTextureCoordinateLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )
    gl.enableVertexAttribArray(aTextureCoordinateLocation)

    gl.useProgram(program)

    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix)
    gl.uniformMatrix4fv(uModelViewMatrixLocation, false, modelViewMatrix)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    tiles.forEach(({ url }, i) => {
      if (!url) return

      let texture
      if (texturesByURL.has(url)) {
        texture = texturesByURL.get(url)!
      } else {
        texture = loadTexture(gl, url)
        texturesByURL.set(url, texture)
      }
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.uniform1i(uSamplerLocation, 0)
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, i * 12)
    })
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

function loadTexture(gl: WebGLRenderingContext, url: string) {
  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]),
  )

  const image = new Image()
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    )
    gl.generateMipmap(gl.TEXTURE_2D)
  }
  image.crossOrigin = 'anonymous'
  image.src = url
  return texture
}
