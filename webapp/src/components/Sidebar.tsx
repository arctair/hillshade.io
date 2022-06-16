const dark = 'hsl(120, 40%, 5%)'
const gray = 'hsl(120, 10%, 40%)'
const light = 'hsl(120, 5%, 75%)'

export default function Sidebar() {
  return (
    <div
      style={{
        height: '100%',
        backgroundColor: light,
        color: dark,
        flexDirection: 'column',
        overflowY: 'scroll',
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
        <a href="https://api.hillshade.io">https://api.hillshade.io</a>
      </div>
    </div>
  )
}
