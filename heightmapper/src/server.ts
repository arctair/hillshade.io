import nodeFetch from 'node-fetch'

const version = process.env.VERSION || 'dev'

console.log('heightmapper version', version)

setInterval(tick, 1000)

async function tick() {
  const response = await nodeFetch('https://api.hillshade.io')
  const { layouts } = (await response.json()) as {
    layouts: KeyedLayout[]
  }
  for (let layout of layouts) {
    if (!layout.heightmapURL) {
      await nodeFetch(`https://api.hillshade.io/layouts/${layout.key}`, {
        method: 'patch',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightmapURL: `https://api.hillshade.io/layouts/${layout.key}.jpg`,
        }),
      })
    }
  }
}

interface KeyedLayout {
  key: string
  heightmapURL: string
}
