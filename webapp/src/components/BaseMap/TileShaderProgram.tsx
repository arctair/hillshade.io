import { createProgram, createShader } from '../shaders'

export interface Context {
  modelViewMatrix: any
  projectionMatrix: any
  tiles: Array<{ url?: string }>
  tileColumnCount: number
  tileRowCount: number
  version: number
}

interface Fields {
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

export default class ShaderProgram {
  fields?: Fields
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

    const program = createProgram(gl, vertexShader, fragmentShader)

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
    } as Fields
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
