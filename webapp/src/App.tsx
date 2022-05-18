import { useEffect, useState } from 'react'

function useBackendStatusText() {
  const [statusText, setStatusText] = useState('pending')

  useEffect(() => {
    ;(async () => {
      while (true) {
        try {
          const response = await fetch('https://api.hillshade.io')
          setStatusText(response.statusText)
          if (response.status >= 200 && response.status < 300) {
            break
          }
        } catch (error) {
          setStatusText(`error: ${error}`)
        }
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    })()
  }, [])

  return statusText
}

export default function App() {
  const statusText = useBackendStatusText()
  return <div>status: {statusText}</div>
}
