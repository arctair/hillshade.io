import ViewState from './ViewState'
import { transformExtent } from './transformations'
import { Extent, Layout } from './types'

export function selectLayout(
  { mapSize: [width, height], offset: [x, y], zoom }: ViewState,
  extent?: Extent,
  transformer = ([x, y]: [number, number]): [number, number] => [x, y],
): Layout {
  const dx = (Math.pow(2, -zoom) / 256) * width
  const dy = (Math.pow(2, -zoom) / 256) * height
  const viewStateExtent = [x, y + dy, x + dx, y] as Extent
  const size: [number, number] = extent
    ? [
        (width * (extent[2] - extent[0])) /
          (viewStateExtent[2] - viewStateExtent[0]),
        (height * (extent[1] - extent[3])) /
          (viewStateExtent[1] - viewStateExtent[3]),
      ]
    : [width, height]
  return {
    size,
    extent: transformExtent(extent || viewStateExtent, transformer),
  }
}
