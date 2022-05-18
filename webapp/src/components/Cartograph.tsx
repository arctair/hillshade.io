import { MutableRefObject, useEffect, useRef, useState } from 'react'

const mat4 = require('gl-mat4')

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>

  const [error, setError] = useState('')

  useEffect(() => {
    const div = ref.current!
    const canvas = canvasRef.current!
    canvas.width = div.clientWidth
    canvas.height = Math.floor(div.clientHeight)

    const projectionMatrix = mat4.create()
    mat4.perspective(
      projectionMatrix,
      (45 * Math.PI) / 180,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100.0,
    )

    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -6.0])

    const gl = canvas.getContext('webgl')
    if (gl === null) {
      return setError('webgl is not supported')
    }

    try {
      const shaderProgram = loadShaderProgram(gl)

      loadVertexAttribArray(
        gl,
        shaderProgram,
        'aVertexPosition',
        3,
        new Float32Array(
          [
            //front
            [-1.0, -1.0, 1.0],
            [1.0, -1.0, 1.0],
            [1.0, 1.0, 1.0],
            [-1.0, 1.0, 1.0],
            //back
            [-1.0, -1.0, -1.0],
            [-1.0, 1.0, -1.0],
            [1.0, 1.0, -1.0],
            [1.0, -1.0, -1.0],
            //top
            [-1.0, 1.0, -1.0],
            [-1.0, 1.0, 1.0],
            [1.0, 1.0, 1.0],
            [1.0, 1.0, -1.0],
            //bottom
            [-1.0, -1.0, -1.0],
            [1.0, -1.0, -1.0],
            [1.0, -1.0, 1.0],
            [-1.0, -1.0, 1.0],
            //right
            [1.0, -1.0, -1.0],
            [1.0, 1.0, -1.0],
            [1.0, 1.0, 1.0],
            [1.0, -1.0, 1.0],
            //left
            [-1.0, -1.0, -1.0],
            [-1.0, -1.0, 1.0],
            [-1.0, 1.0, 1.0],
            [-1.0, 1.0, -1.0],
          ].flat(),
        ),
      )

      loadVertexAttribArray(
        gl,
        shaderProgram,
        'aVertexColor',
        4,
        new Float32Array(
          [
            //front
            [1.0, 1.0, 1.0, 1.0],
            //back
            [1.0, 0.0, 0.0, 1.0],
            //top
            [0.0, 1.0, 0.0, 1.0],
            //bottom
            [0.0, 0.0, 1.0, 1.0],
            //right
            [1.0, 1.0, 0.0, 1.0],
            //left
            [1.0, 0.0, 1.0, 1.0],
          ].flatMap((array) => repeat(array, 4)),
        ),
      )

      gl.useProgram(shaderProgram)

      const indices = loadBufferSource(
        gl,
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array(
          [
            [0, 1, 2, 0, 2, 3],
            [4, 5, 6, 4, 6, 7],
            [8, 9, 10, 8, 10, 11],
            [12, 13, 14, 12, 14, 15],
            [16, 17, 18, 16, 18, 19],
            [20, 21, 22, 20, 22, 23],
          ].flat(),
        ),
      )

      let then = 0
      const frame = (now: number) => {
        try {
          const delta = now - then
          mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            (Math.PI / 4096) * delta,
            [0, 0, 1],
          )
          mat4.rotate(
            modelViewMatrix,
            modelViewMatrix,
            (Math.PI / 2048) * delta,
            [0, 1, 0],
          )
          then = now
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
          gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0)
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

const defaultVertexShaderSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vColor = aVertexColor;
}`

const defaultFragmentShaderSource = `
varying lowp vec4 vColor;

void main() {
  gl_FragColor = vColor;
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

function repeat<T>(array: Array<T>, times: number) {
  const result: Array<T> = []
  for (let i = 0; i < times; i++) {
    array.forEach((e) => result.push(e))
  }
  return result
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
