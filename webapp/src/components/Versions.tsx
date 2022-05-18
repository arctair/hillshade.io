import ClientVersion from './ClientVersion'
import ServerVersion from './ServerVersion'

export default function Versions() {
  return (
    <div
      style={{
        padding: '0 0.25rem',
        textAlign: 'right',
      }}
    >
      <ClientVersion /> | <ServerVersion />
    </div>
  )
}
