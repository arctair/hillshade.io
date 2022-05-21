import { RefObject, useEffect, useRef } from 'react'

const mat4 = require('gl-mat4')

type useModelViewMatrixOffsetBindingProps = {
  modelViewMatrixRef: RefObject<any>
  offset: [number, number]
}
export default function useModelViewMatrixOffsetBinding({
  modelViewMatrixRef,
  offset,
}: useModelViewMatrixOffsetBindingProps) {
  const defaultOffsetRef = useRef(offset)
  const lastOffsetRef = useRef(offset)
  const modelViewMatrix = modelViewMatrixRef.current!

  useEffect(() => {
    if (!modelViewMatrix) return
    const [dx, dy, dz] = [
      -defaultOffsetRef.current[0],
      -defaultOffsetRef.current[1],
      -1.0,
    ]
    mat4.translate(modelViewMatrix, modelViewMatrix, [dx, dy, dz])
    return () =>
      mat4.translate(modelViewMatrix, modelViewMatrix, [-dx, -dy, -dz])
  }, [modelViewMatrix])

  useEffect(() => {
    if (!modelViewMatrix) return
    const lastOffset = lastOffsetRef.current
    const [dx, dy] = [offset[0] - lastOffset[0], offset[1] - lastOffset[1]]
    mat4.translate(modelViewMatrix, modelViewMatrix, [-dx, -dy, 0])
    lastOffsetRef.current = offset
  }, [modelViewMatrix, offset])
}
