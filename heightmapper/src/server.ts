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
      const response = await nodeFetch(`https://api.hillshade.io/images`, {
        method: 'post',
        headers: { 'Content-Type': 'image/garbage' },
        body: Buffer.from('asdfqwerty'),
      })
      const { key } = await response.json()
      await nodeFetch(`https://api.hillshade.io/layouts/${layout.key}`, {
        method: 'patch',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightmapURL: `https://api.hillshade.io/images/${key}.garbage`,
        }),
      })
    }
  }
}

interface KeyedLayout {
  key: string
  heightmapURL: string
}
