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
  return versionError ? (
    <>error fetching server version: {versionError}</>
  ) : (
    <>server: {version}</>
  )
}
