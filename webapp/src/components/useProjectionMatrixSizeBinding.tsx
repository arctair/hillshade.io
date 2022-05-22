import { RefObject, useEffect } from 'react'

const mat4 = require('gl-mat4')

type useProjectionMatrixSizeBindingProps = {
  projectionMatrixRef: RefObject<any>
  size: { width: number; height: number }
}
export default function useProjectionMatrixSizeBinding({
  projectionMatrixRef,
  size,
}: useProjectionMatrixSizeBindingProps) {
  const projectionMatrix = projectionMatrixRef.current!
  useEffect(() => {
    mat4.ortho(
      projectionMatrix,
      0,
      size.width / 256,
      size.height / 256,
      0,
      0.1,
      100.0,
    )
  }, [projectionMatrix, size])
}
