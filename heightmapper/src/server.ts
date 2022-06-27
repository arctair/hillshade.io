import nodeFetch from 'node-fetch'

const version = process.env.VERSION || 'dev'

console.log('heightmapper version', version)

setInterval(tick, 1000)

async function tick() {
  const response = await nodeFetch('https://api.hillshade.io')
  const { layouts } = (await response.json()) as {
    layouts: KeyedLayout[]
  }
  for (let {
    extent: [left, bottom, right, top],
    heightmapURL,
    key,
    size: [width, height],
  } of layouts) {
    if (!heightmapURL) {
      const response = await nodeFetch(`https://api.hillshade.io/images`, {
        method: 'post',
        headers: { 'Content-Type': 'application/x-zsh' },
        body: Buffer.from(
          `#!/bin/zsh\ngdalwarp -t_srs EPSG:3857 -te ${left} ${bottom} ${right} ${top} -ts ${width} ${height} faster/usgs-3dep-1.vrt /tmp/${key}.jpg`,
        ),
      })
      const { key: attachmentKey } = await response.json()
      await nodeFetch(`https://api.hillshade.io/layouts/${key}`, {
        method: 'patch',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightmapURL: `https://api.hillshade.io/images/${attachmentKey}.zsh`,
        }),
      })
    }
  }
}

interface KeyedLayout {
  key: string
  size: [number, number]
  extent: [number, number, number, number]
  heightmapURL: string
}
