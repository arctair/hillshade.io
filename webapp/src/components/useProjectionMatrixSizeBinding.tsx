import { RefObject, useEffect } from 'react'
import ViewState from './ViewState'

const mat4 = require('gl-mat4')

type useProjectionMatrixSizeBindingProps = {
  projectionMatrixRef: RefObject<any>
  viewState: ViewState
}
export default function useProjectionMatrixSizeZoomBinding({
  projectionMatrixRef,
  viewState: { mapSize, zoom },
}: useProjectionMatrixSizeBindingProps) {
  const projectionMatrix = projectionMatrixRef.current!
  useEffect(() => {
    const scale = Math.pow(2, zoom)
    mat4.ortho(
      projectionMatrix,
      0,
      mapSize[0] / 256 / scale,
      mapSize[1] / 256 / scale,
      0,
      0.1,
      100.0,
    )
  }, [projectionMatrix, mapSize, zoom])
}
