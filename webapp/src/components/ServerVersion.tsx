import { useEffect, useState } from 'react'

function useServerVersion() {
  const [version, setVersion] = useState('pending')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const response = await fetch('https://api.hillshade.io')
        if (response.status >= 200 && response.status < 300) {
          setVersion(await response.text())
        } else {
          setError(response.statusText)
        }
      } catch (error) {
        setError(`error: ${error}`)
      }
    })()
  }, [])

  return [version, error]
}

export default function ServerVersion() {
  const [version, versionError] = useServerVersion()
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        bottom: 0,
        textAlign: 'right',
      }}
    >
      {versionError ? (
        <div>error fetching backend version: {versionError}</div>
      ) : (
        <div>backend version: {version}</div>
      )}
    </div>
  )
}
