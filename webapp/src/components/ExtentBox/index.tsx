import { useEffect, useRef } from 'react'
import { createProgram, createShader } from '../shaders'
import { useMapSize } from '../ViewState'

const mat4 = require('gl-mat4')

export default function ExtentBox() {
  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>

  useMapSize(canvasRef)
  useEffect(() => {
    const modelViewMatrix = mat4.create()
    mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -6])

    const projectionMatrix = mat4.create()
    mat4.ortho(projectionMatrix, 0, 1, 1, 0, 0.1, 100.0)

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl')
    if (!gl) {
      console.error('no webgl')
      return
    }

    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      ` attribute vec4 aVertexPosition;

        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoordinate;

        void main() {
          gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }`,
    )

    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      ` void main() {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`,
    )

    const program = createProgram(gl, vertexShader, fragmentShader)

    const aVertexPositionLocation = gl.getAttribLocation(
      program,
      'aVertexPosition',
    )
    const uProjectionMatrixLocation = gl.getUniformLocation(
      program,
      'uProjectionMatrix',
    )
    const uModelViewMatrixLocation = gl.getUniformLocation(
      program,
      'uModelViewMatrix',
    )

    const positionBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    let positions = [0.25, 0.25, 0.75, 0.25, 0.75, 0.75, 0.25, 0.75]
    let indices = [0, 1, 2, 3]

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(positions),
      gl.STATIC_DRAW,
    )
    gl.vertexAttribPointer(
      aVertexPositionLocation,
      2,
      gl.FLOAT,
      false,
      0,
      0,
    )
    gl.enableVertexAttribArray(aVertexPositionLocation)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      gl.STATIC_DRAW,
    )

    gl.lineWidth(1)

    gl.clearColor(0.0, 0.0, 0.0, 0.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)

    gl.useProgram(program)
    gl.uniformMatrix4fv(uProjectionMatrixLocation, false, projectionMatrix)
    gl.uniformMatrix4fv(uModelViewMatrixLocation, false, modelViewMatrix)
    gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_SHORT, 0)
  }, [])

  return (
    <canvas ref={canvasRef} style={{ height: '100%', width: '100%' }} />
  )
}
