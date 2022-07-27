import { CSSProperties } from 'react'
import { Extent } from '../types'
import ViewState from '../ViewState'
import { State } from './types'

export const selectActive = ({ dragging, startSelect }: State) =>
  dragging || startSelect

export const selectBoxStyle = (
  { offset: [x, y], zoom }: ViewState,
  [x0, y0, x1, y1]: Extent,
): CSSProperties => {
  const scale = Math.pow(2, zoom)
  const left = (x0 - x) * 256 * scale
  const bottom = (y0 - y) * 256 * scale
  const right = (x1 - x) * 256 * scale
  const top = (y1 - y) * 256 * scale
  return {
    left: px(left),
    top: px(top),
    width: px(right - left),
    height: px(bottom - top),
  }
}

const px = (v: number) => `${v}px`
