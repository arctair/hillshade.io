import { v4 as uuid } from 'uuid'

export const errNoContentType =
  'Uploaded images must have a content-type header'
export const errKeyNotFound = 'That image key is not present'

export type Store = {
  create: (contentType: string, buffer: Buffer) => [string?, string?]
  get: (key: string) => [string?, Buffer?, string?]
}
export default function Store(): Store {
  const contentTypeByKey = new Map<
    string,
    { contentType: string; buffer: Buffer }
  >()
  return {
    create: (contentType, buffer) => {
      if (!contentType) return [undefined, errNoContentType]
      const key = uuid()
      contentTypeByKey.set(key, { contentType, buffer })
      return [key, undefined]
    },
    get: (key) => {
      const maybe = contentTypeByKey.get(key)
      if (!maybe) return [undefined, undefined, errKeyNotFound]
      const { contentType, buffer } = maybe
      return [contentType, buffer, undefined]
    },
  }
}
