export default function ClientVersion() {
  return <div>client: {process.env.REACT_APP_GIT_VERSION}</div>
}
