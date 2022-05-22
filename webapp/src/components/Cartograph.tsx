import { MutableRefObject, useEffect, useRef, useState } from 'react'
import MapControls from './MapControls'
import useModelViewMatrixOffsetBinding from './useModelViewMatrixOffsetBinding'
import useProjectionMatrixSizeZoomBinding from './useProjectionMatrixSizeBinding'

const mat4 = require('gl-mat4')

const defaultOffset: [number, number] = [
  330 / Math.pow(2, 11),
  715 / Math.pow(2, 11),
]

type Tile = {
  url: string
  left: number
  top: number
  right: number
  bottom: number
  zoom: number
  texture: WebGLTexture
}

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>
  const glRef = useRef() as MutableRefObject<WebGLRenderingContext>
  const tilesRef = useRef(new Array<Tile>())
  const filteredTilesRef = useRef(new Array<Tile>())
  const tilesRefVersion = useRef(0)
  const tilesRefLoadedVersion = useRef(0)
  const indicesRef = useRef() as MutableRefObject<WebGLBuffer>

  const [error, setError] = useState('')

  const [size, setSize] = useState({ width: 0, height: 0 })
  const [offset, setOffset] = useState(defaultOffset)
  const [zoom, setZoom] = useState(11)
  const scale = Math.pow(2, zoom)
  const lastZoomFloorRef = useRef(zoom)

  const modelViewMatrixRef = useRef(mat4.create())
  const projectionMatrixRef = useRef(mat4.create())

  useModelViewMatrixOffsetBinding({
    modelViewMatrixRef,
    offset,
  })

  useProjectionMatrixSizeZoomBinding({
    projectionMatrixRef,
    size,
    scale,
  })

  useEffect(() => {
    const tiles = tilesRef.current
    const gl = glRef.current
    if (!gl) return

    const zoomFloor = Math.floor(zoom)
    const scaleFloor = Math.pow(2, zoomFloor)
    for (
      let x = Math.floor(offset[0] * scaleFloor);
      x < offset[0] * scaleFloor + size.width / 256;
      x++
    ) {
      for (
        let y = Math.floor(offset[1] * scaleFloor);
        y < offset[1] * scaleFloor + size.height / 256;
        y++
      ) {
        const queryString = `lyrs=y&hl=en&x=${x}&y=${y}&z=${zoomFloor}`
        const url = `https://mt0.google.com/vt/${queryString}`
        if (tiles.every((tile) => tile.url !== url)) {
          tiles.push({
            url,
            left: x / scaleFloor,
            top: y / scaleFloor,
            right: x / scaleFloor + 1 / scaleFloor,
            bottom: y / scaleFloor + 1 / scaleFloor,
            zoom: zoomFloor,
            texture: loadTexture(
              gl,
              `https://mt0.google.com/vt/${queryString}`,
            )!,
          })
          tilesRefVersion.current++
        }
      }
    }

    filteredTilesRef.current = tiles.filter(
      (tile) => tile.zoom === zoomFloor,
    )
    if (zoomFloor !== lastZoomFloorRef.current) {
      lastZoomFloorRef.current = zoomFloor
      tilesRefVersion.current++
    }
  }, [offset, size, zoom])

  useEffect(() => {
    const modelViewMatrix = modelViewMatrixRef.current!
    const projectionMatrix = projectionMatrixRef.current!

    const div = ref.current!
    const canvas = canvasRef.current!
    const devicePixelRatio = window.devicePixelRatio || 1
    const width = div.clientWidth * devicePixelRatio
    const height = Math.floor(div.clientHeight * devicePixelRatio)
    canvas.width = width
    canvas.height = height
    setSize({ width, height })

    const gl = canvas.getContext('webgl')
    if (gl === null) return setError('webgl is not supported')
    glRef.current = gl

    try {
      const shaderProgram = loadShaderProgram(gl)

      const frame = () => {
        const filteredTiles = filteredTilesRef.current
        try {
          if (tilesRefVersion.current > tilesRefLoadedVersion.current) {
            tilesRefLoadedVersion.current = tilesRefVersion.current

            loadVertexAttribArray(
              gl,
              shaderProgram,
              'aVertexPosition',
              3,
              new Float32Array(
                filteredTiles.flatMap(({ left, top, right, bottom }) => [
                  left,
                  top,
                  0,
                  right,
                  top,
                  0,
                  right,
                  bottom,
                  0,
                  left,
                  bottom,
                  0,
                ]),
              ),
            )

            loadVertexAttribArray(
              gl,
              shaderProgram,
              'aTexturePosition',
              2,
              new Float32Array(
                filteredTiles.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1]),
              ),
            )

            const indicesSource = new Uint16Array(
              filteredTiles
                .map((_, index) => index * 4)
                .flatMap((offset) => [
                  offset,
                  offset + 1,
                  offset + 2,
                  offset,
                  offset + 2,
                  offset + 3,
                ]),
            )
            indicesRef.current = loadBufferSource(
              gl,
              gl.ELEMENT_ARRAY_BUFFER,
              indicesSource,
            )!
          }

          gl.useProgram(shaderProgram)

          gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            false,
            modelViewMatrix,
          )

          gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            false,
            projectionMatrix,
          )

          gl.clearColor(0.125 / 2, 0.125 / 2, 0.125 / 2, 1)
          gl.clearDepth(1.0)
          gl.enable(gl.DEPTH_TEST)
          gl.depthFunc(gl.LEQUAL)
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesRef.current)

          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0)
          gl.activeTexture(gl.TEXTURE0)

          filteredTiles.forEach(({ texture }, index) => {
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12 * index)
          })

          setError('')
        } catch (error) {
          setError(`animation frame error: ${error}`)
        }

        requestAnimationFrame(frame)
      }

      requestAnimationFrame(frame)
    } catch (error) {
      setError(`shader error: ${error}`)
    }
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
        <MapControls
          onPan={([dx, dy]) =>
            setOffset(([x, y]) => [x + dx / scale, y + dy / scale])
          }
          onZoom={(dz) => setZoom((zoom) => zoom + dz)}
        />
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

function loadTexture(gl: WebGLRenderingContext, src: string) {
  const texture = gl.createTexture()
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
    new Uint8Array([0, 0, 0, 1]),
  )
  const image = new Image()
  image.onload = () => {
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
  image.src = src
  return texture
}

const defaultVertexShaderSource = `
attribute vec4 aVertexPosition;
attribute vec2 aTexturePosition;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying highp vec2 vTexturePosition;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vTexturePosition = aTexturePosition;
}`

const defaultFragmentShaderSource = `
varying highp vec2 vTexturePosition;

uniform sampler2D uSampler;

void main() {
  gl_FragColor = texture2D(uSampler, vTexturePosition);
}`

function loadShaderProgram(
  gl: WebGLRenderingContext,
  vertexShaderSource: string = defaultVertexShaderSource,
  fragmentShaderSource: string = defaultFragmentShaderSource,
) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = loadShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  )

  const shaderProgram = gl.createProgram()!
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    const shaderInfoLog = gl.getProgramInfoLog(shaderProgram)
    throw Error(`unable to load the shader program: ${shaderInfoLog}`)
  }

  gl.useProgram(shaderProgram)

  return shaderProgram
}

function loadShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const shaderInfoLog = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw Error(`unable to load the shader: ${shaderInfoLog}`)
  }
  return shader
}

function loadVertexAttribArray(
  gl: WebGLRenderingContext,
  shaderProgram: WebGLProgram,
  attributeName: string,
  attributeSize: number,
  bufferSource: Float32Array,
) {
  loadBufferSource(gl, gl.ARRAY_BUFFER, bufferSource)
  const location = gl.getAttribLocation(shaderProgram, attributeName)
  gl.vertexAttribPointer(location, attributeSize, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(location)
}

function loadBufferSource(
  gl: WebGLRenderingContext,
  type: number,
  bufferSource: BufferSource,
) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, bufferSource, gl.STATIC_DRAW)
  return buffer
}
