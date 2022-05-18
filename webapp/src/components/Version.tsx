import { useEffect, useState } from 'react'

function useBackendVersion() {
  const [version, setVersion] = useState('pending')
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      while (true) {
        try {
          const response = await fetch('https://api.hillshade.io')
          if (response.status >= 200 && response.status < 300) {
            setVersion(await response.text())
            break
          }
          setError(response.statusText)
        } catch (error) {
          setError(`error: ${error}`)
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    })()
  }, [])

  return [version, error]
}

export default function Version() {
  const [version, versionError] = useBackendVersion()
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
