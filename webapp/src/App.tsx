import ClientVersion from './components/ClientVersion'
import ServerVersion from './components/ServerVersion'

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
        <ClientVersion />
        <ServerVersion />
      </div>
    </div>
  )
}
