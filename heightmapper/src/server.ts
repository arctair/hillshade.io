import { spawn } from 'child_process'
import { createReadStream, mkdir as mkdirSync, rm as rmSync } from 'fs'
import nodeFetch from 'node-fetch'
import { Readable } from 'stream'
import { buffer } from 'stream/consumers'
import { promisify } from 'util'

const mkdir = promisify(mkdirSync)
const rm = promisify(rmSync)

const version = process.env.VERSION || 'dev'
const globalElevationFilePath = process.env.GLOBAL_ELEVATION_FILE

console.log('heightmapper version', version)

setInterval(tick, 1000)

async function tick() {
  try {
    const response = await nodeFetch('https://api.hillshade.io')
    const { layouts } = (await response.json()) as {
      layouts: KeyedLayout[]
    }
    for (let layout of layouts) {
      if (!layout.attachments.heightmapURL) {
        const workspace = `/tmp/heightmapper/${layout.key}`
        try {
          await mkdir(workspace, { recursive: true })
          await pipeline(workspace, layout)
        } catch (e) {
          console.error('failed to pipeline', layout.key, e)
        } finally {
          await rm(workspace, { recursive: true })
        }
      }
    }
  } catch (e) {
    console.error('failed tick', e)
  }
}

async function pipeline(
  workspace: string,
  {
    extent: [left, bottom, right, top],
    key,
    size: [width, height],
  }: KeyedLayout,
) {
  const warpPath = `${workspace}/warp.tif`
  await new Promise<void>((resolve, reject) => {
    const process = spawnzsh(
      `gdalwarp -t_srs EPSG:3857`,
      `-te ${left} ${bottom} ${right} ${top}`,
      `-ts ${width} ${height}`,
      `${globalElevationFilePath} ${warpPath}`,
    )
    process.on('exit', (code) =>
      code === 0 ? resolve() : reject('warp failed'),
    )
  })

  const [min, max] = await new Promise<[number, number]>(
    (resolve, reject) => {
      const process = spawnzsh(`gdalinfo -mm ${warpPath}`)
      bufferLines(process.stdout, (line) => {
        if (line.indexOf('Computed Min/Max') > -1) {
          const [_, part] = line.split('=')
          const [min, max] = part.split(',').map((v) => parseFloat(v))
          resolve([min, max])
        }
      })
      process.on('exit', (code) => code !== 0 && reject('minmax failed'))
    },
  )

  const heightmapPath = `${workspace}/heightmap.tif`
  await new Promise<void>((resolve, reject) => {
    const process = spawnzsh(
      `gdal_translate`,
      `-scale ${min} ${max} 0 255`,
      `${warpPath} ${heightmapPath}`,
    )
    process.on('exit', (code) =>
      code === 0 ? resolve() : reject('translate failed'),
    )
  })

  const previewPath = `${workspace}/heightmapPreview.jpg`
  await new Promise<void>((resolve, reject) => {
    const process = spawnzsh(
      `gdal_translate`,
      `${heightmapPath} ${previewPath}`,
    )
    process.on('exit', (code) =>
      code === 0 ? resolve() : reject('preview failed'),
    )
  })

  let response = await nodeFetch(`https://api.hillshade.io/images`, {
    method: 'post',
    headers: { 'Content-Type': 'image/tif' },
    body: createReadStream(heightmapPath),
  })
  const { key: heightmapAttachmentKey } = await response.json()
  const heightmapURL = `https://api.hillshade.io/images/${heightmapAttachmentKey}.tif`

  response = await nodeFetch(`https://api.hillshade.io/images`, {
    method: 'post',
    headers: { 'Content-Type': 'image/jpg' },
    body: createReadStream(previewPath),
  })
  const { key: previewAttachmentKey } = await response.json()
  const heightmapPreviewURL = `https://api.hillshade.io/images/${previewAttachmentKey}.jpg`

  response = await nodeFetch(`https://api.hillshade.io/layouts/${key}`, {
    method: 'patch',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: { heightmapURL, heightmapPreviewURL },
    }),
  })
}
interface KeyedLayout {
  key: string
  size: [number, number]
  extent: [number, number, number, number]
  attachments: { heightmapURL: string }
}

function spawnzsh(...command: string[]) {
  return spawn('zsh', ['-c', command.join(' ')])
}

function bufferLines(stream: Readable, consumer: (line: string) => void) {
  let buffer = ''
  stream.on('data', (data) => {
    buffer += data.toString()
    const lines = buffer.split('\n')
    for (let index = 0; index < lines.length - 1; index++) {
      consumer(lines[index])
    }
    buffer = lines[lines.length - 1]
  })
}
