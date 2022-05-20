import { MutableRefObject, useEffect, useRef, useState } from 'react'

const mat4 = require('gl-mat4')

const defaultOffset = [330, 715]

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>

  const [error, setError] = useState('')

  useEffect(() => {
    const div = ref.current!
    const canvas = canvasRef.current!
    const devicePixelRatio = window.devicePixelRatio || 1
    canvas.width = div.clientWidth * devicePixelRatio
    canvas.height = Math.floor(div.clientHeight * devicePixelRatio)

    const projectionMatrix = mat4.create()
    mat4.ortho(
      projectionMatrix,
      0,
      canvas.width / 256,
      canvas.height / 256,
      0,
      0.1,
      100.0,
    )

    const [xOffset, yOffset] = defaultOffset

    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [
      -xOffset,
      -yOffset,
      -1.0,
    ])

    const gl = canvas.getContext('webgl')
    if (gl === null) {
      return setError('webgl is not supported')
    }

    try {
      const shaderProgram = loadShaderProgram(gl)
      const textures: Array<{
        x: number
        y: number
        texture: WebGLTexture
      }> = []
      for (
        let x = Math.floor(xOffset);
        x <= xOffset + canvas.width / 256;
        x++
      ) {
        for (
          let y = Math.floor(yOffset);
          y <= yOffset + canvas.height / 256;
          y++
        ) {
          const queryString = `lyrs=y&hl=en&x=${x}&y=${y}&z=11`
          textures.push({
            x,
            y,
            texture: loadTexture(
              gl,
              `https://mt0.google.com/vt/${queryString}`,
            )!,
          })
        }
      }

      loadVertexAttribArray(
        gl,
        shaderProgram,
        'aVertexPosition',
        3,
        new Float32Array(
          textures.flatMap(({ x, y }) => [
            x,
            y,
            0,
            x + 1,
            y,
            0,
            x + 1,
            y + 1,
            0,
            x,
            y + 1,
            0,
          ]),
        ),
      )

      loadVertexAttribArray(
        gl,
        shaderProgram,
        'aTexturePosition',
        2,
        new Float32Array(textures.flatMap(() => [0, 0, 1, 0, 1, 1, 0, 1])),
      )

      const indicesSource = new Uint16Array(
        textures
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
      const indices = loadBufferSource(
        gl,
        gl.ELEMENT_ARRAY_BUFFER,
        indicesSource,
      )

      const frame = () => {
        try {
          gl.useProgram(shaderProgram)

          gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            false,
            projectionMatrix,
          )

          gl.uniformMatrix4fv(
            gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            false,
            modelViewMatrix,
          )

          gl.clearColor(0.125 / 2, 0.125 / 2, 0.125 / 2, 1)
          gl.clearDepth(1.0)
          gl.enable(gl.DEPTH_TEST)
          gl.depthFunc(gl.LEQUAL)
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)

          gl.uniform1i(gl.getUniformLocation(shaderProgram, 'uSampler'), 0)
          gl.activeTexture(gl.TEXTURE0)

          textures.forEach(({ texture }, index) => {
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 12 * index)
          })

          setError('')
        } catch (error) {
          setError(`draw error: ${error}`)
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
    return Error(`unable to load the shader: ${shaderInfoLog}`)
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
