import { MutableRefObject, useEffect, useRef, useState } from 'react'
import { useViewState } from '../ViewState'
import {
  selectGLExtent2D,
  selectTileExtent2D,
} from '../ViewState/selectors'
import TileShaderProgram, {
  Context as TileShaderProgramContext,
} from './TileShaderProgram'

const mat4 = require('gl-mat4')

export default function BaseMap() {
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>
  const contextRef = useRef<TileShaderProgramContext>({
    modelViewMatrix: mat4.create(),
    projectionMatrix: mat4.create(),
    tiles: [],
    tileRowCount: 0,
    tileColumnCount: 0,
    version: 0,
  })

  const [error, setError] = useState('')
  const [viewState] = useViewState()

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
      context.version++
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
    const context = contextRef.current
    const tileShaderProgram = new TileShaderProgram(
      canvasRef.current,
      context,
      setError,
    )
    let lastContextVersion = 0
    let animationFrame: number
    function doAnimationFrame() {
      if (lastContextVersion !== context.version) {
        tileShaderProgram.loadBuffers()
        lastContextVersion = context.version
      }
      tileShaderProgram.animationFrame()
      animationFrame = requestAnimationFrame(doAnimationFrame)
    }
    doAnimationFrame()
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div style={{ height: '100%', position: 'relative' }}>
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
