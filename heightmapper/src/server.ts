import { spawn } from 'child_process'
import { createReadStream, mkdir as mkdirSync, rm as rmSync } from 'fs'
import nodeFetch from 'node-fetch'
import { Readable } from 'stream'
import { promisify } from 'util'

const mkdir = promisify(mkdirSync)
const rm = promisify(rmSync)

const version = process.env.VERSION || 'dev'
const globalElevationFilePath = process.env.GLOBAL_ELEVATION_FILE

console.log('heightmapper version', version)

setInterval(async () => {
  try {
    await tick()
  } catch (e) {
    console.error(e)
  }
}, 1000)

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
      const workspace = `/tmp/heightmapper/${key}`
      await mkdir(workspace, { recursive: true })

      const warpPath = `${workspace}/heightmap.tif`
      await new Promise<void>((resolve, reject) => {
        const process = spawn('zsh', [
          '-c',
          `gdalwarp -t_srs EPSG:3857 -te ${left} ${bottom} ${right} ${top} -ts ${width} ${height} -overwrite ${globalElevationFilePath} ${warpPath}`,
        ])
        // bufferLines(process.stdout, console.log)
        // bufferLines(process.stderr, console.error)
        process.on('exit', (code) => (code === 0 ? resolve() : reject()))
      })

      const [min, max] = await new Promise<[number, number]>(
        (resolve, reject) => {
          const process = spawn('zsh', ['-c', `gdalinfo -mm ${warpPath}`])
          bufferLines(process.stdout, (line) => {
            if (line.indexOf('Computed Min/Max') > -1) {
              const [_, part] = line.split('=')
              const [min, max] = part.split(',').map((v) => parseFloat(v))
              resolve([min, max])
            }
          })
          // bufferLines(process.stderr, console.error)
          process.on('exit', (code) => code !== 0 && reject())
        },
      )

      const translatePath = `${workspace}/heightmap.jpg`
      await new Promise<void>((resolve, reject) => {
        const process = spawn('zsh', [
          '-c',
          `gdal_translate -scale ${min} ${max} 0 255 ${warpPath} ${translatePath}`,
        ])
        // bufferLines(process.stdout, console.log)
        // bufferLines(process.stderr, console.error)
        process.on('exit', (code) => (code === 0 ? resolve() : reject()))
      })

      let response = await nodeFetch(`https://api.hillshade.io/images`, {
        method: 'post',
        headers: { 'Content-Type': 'image/jpg' },
        body: createReadStream(translatePath),
      })
      const { key: attachmentKey } = await response.json()

      response = await nodeFetch(
        `https://api.hillshade.io/layouts/${key}`,
        {
          method: 'patch',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            heightmapURL: `https://api.hillshade.io/images/${attachmentKey}.jpg`,
          }),
        },
      )

      await rm(workspace, { recursive: true })
    }
  }
}

interface KeyedLayout {
  key: string
  size: [number, number]
  extent: [number, number, number, number]
  heightmapURL: string
}

function bufferLines(stream: Readable, fn: (v: string) => void) {
  let buffer = ''
  stream.on('data', (data) => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    for (let index = 0; index < lines.length - 1; index++) {
      fn(lines[index])
    }
    buffer = lines[lines.length - 1]
  })
}
