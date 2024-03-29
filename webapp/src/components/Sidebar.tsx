import RenderControls from './RenderControls'

const dark = 'hsl(120, 10%, 30%)'
const gray = 'hsl(120, 10%, 30%)'
const light = 'hsl(120, 5%, 75%)'

export default function Sidebar() {
  return (
    <div
      style={{
        height: '100%',
        backgroundColor: light,
        color: dark,
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '0.25rem 0.5rem',
          fontSize: '2rem',
          textAlign: 'center',
          fontWeight: 'bold',
          backgroundColor: gray,
          color: light,
          boxSizing: 'border-box',
        }}
      >
        hillshade.io
      </div>
      <div
        style={{
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <RenderControls />
      </div>
    </div>
  )
}
