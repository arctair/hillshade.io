import { MutableRefObject, useEffect, useRef, useState } from 'react'

export default function Cartograph() {
  const ref = useRef() as MutableRefObject<HTMLDivElement>
  const canvasRef = useRef() as MutableRefObject<HTMLCanvasElement>

  const [error, setError] = useState('')

  useEffect(() => {
    const div = ref.current!
    const canvas = canvasRef.current!
    canvas.width = div.clientWidth
    canvas.height = div.clientHeight - 1

    const gl = canvas.getContext('webgl')
    if (gl === null) {
      return setError('webgl is not supported')
    }
    gl.clearColor(0.125 / 2, 0.125 / 2, 0.125 / 2, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }, [])

  return (
    <div style={{ height: '100%', position: 'relative' }} ref={ref}>
      <canvas
        style={{
          display: 'block',
          position: 'absolute',
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
