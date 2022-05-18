import Versions from './components/Versions'

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        textAlign: 'right',
      }}
    >
      <div style={{ flex: 1 }} />
      <div style={{ flex: 0 }}>
        <Versions />
      </div>
    </div>
  )
}
