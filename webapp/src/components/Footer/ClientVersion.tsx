export default function ClientVersion() {
  return <>client: {process.env.REACT_APP_GIT_VERSION}</>
}
