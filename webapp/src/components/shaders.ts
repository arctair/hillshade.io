export function createShader(
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

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
) {
  const program = gl.createProgram()!
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const programInfoLog = gl.getProgramInfoLog(program)
    const message = `Unable to initialize the shader program: ${programInfoLog}`
    throw Error(message)
  }

  return program
}
