import ViewState from '.'
import { Layout } from '../types'

export function selectGLExtent2D({
  mapSize: [width, height],
  offset: [x, y],
  zoom,
}: ViewState): [number, number, number, number] {
  const [left, right] = selectGLExtent1D({ size: width, offset: x, zoom })
  const [top, bottom] = selectGLExtent1D({ size: height, offset: y, zoom })
  return [left, right, bottom, top]
}

export function selectGLExtent1D({
  size,
  offset,
  zoom,
}: {
  size: number
  offset: number
  zoom: number
}): [number, number] {
  const zTileSize = Math.pow(2, -Math.floor(zoom))
  const glStart = modabove(offset, zTileSize) / zTileSize
  const glSize = size / 256 / Math.pow(2, modabove(zoom))
  return [glStart, glStart + glSize]
}

function modabove(value: number, threshold = 1) {
  return ((value % threshold) + threshold) % threshold
}

export function selectTileExtent2D({
  mapSize: [width, height],
  offset: [x, y],
  zoom,
}: ViewState): [number, number, number, number] {
  const [left, right] = selectTileExtent1D({
    size: width,
    offset: x,
    zoom,
  })
  const [top, bottom] = selectTileExtent1D({
    size: height,
    offset: y,
    zoom,
  })
  return [left, right, bottom, top]
}

export function selectTileExtent1D({
  size,
  offset,
  zoom,
}: {
  size: number
  offset: number
  zoom: number
}) {
  const tileCount = Math.pow(2, Math.floor(zoom))
  const offsetFloor = Math.floor(offset * tileCount)
  return [offsetFloor, offsetFloor + size / 256 + 1]
}

export function selectLayout({
  mapSize: [width, height],
  offset: [x, y],
  zoom,
}: ViewState): Layout {
  const dx = (Math.pow(2, -zoom) / 256) * width
  const dy = (Math.pow(2, -zoom) / 256) * height
  return {
    size: [width, height],
    extent: [x, y + dy, x + dx, y],
  }
}
