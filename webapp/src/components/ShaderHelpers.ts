export function loadTexture(gl: WebGLRenderingContext, src: string) {
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

export function loadShaderProgram(
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

export function loadShader(
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

export function loadVertexAttribArray(
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

export function loadBufferSource(
  gl: WebGLRenderingContext,
  type: number,
  bufferSource: BufferSource,
) {
  const buffer = gl.createBuffer()
  gl.bindBuffer(type, buffer)
  gl.bufferData(type, bufferSource, gl.STATIC_DRAW)
  return buffer
}
