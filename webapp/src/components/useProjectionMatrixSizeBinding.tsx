import { RefObject, useEffect } from 'react'

const mat4 = require('gl-mat4')

type useProjectionMatrixSizeBindingProps = {
  projectionMatrixRef: RefObject<any>
  size: { width: number; height: number }
  scale: number
}
export default function useProjectionMatrixSizeZoomBinding({
  projectionMatrixRef,
  size,
  scale,
}: useProjectionMatrixSizeBindingProps) {
  const projectionMatrix = projectionMatrixRef.current!
  useEffect(() => {
    mat4.ortho(
      projectionMatrix,
      0,
      size.width / 256 / scale,
      size.height / 256 / scale,
      0,
      0.1,
      100.0,
    )
  }, [projectionMatrix, size, scale])
}
