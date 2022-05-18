import ClientVersion from './ClientVersion'
import ServerVersion from './ServerVersion'

export default function Versions() {
  return (
    <div>
      <ClientVersion /> | <ServerVersion />
    </div>
  )
}
