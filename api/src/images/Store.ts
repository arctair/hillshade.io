import { v4 as uuid } from 'uuid'

export const errNoContentType =
  'Uploaded images must have a content-type header'
export const errKeyNotFound = 'That image key is not present'

export type Store = {
  create: (contentType: string, data: any) => [string?, string?]
  get: (key: string) => [string?, Buffer?, string?]
}
export default function Store(): Store {
  const contentTypeByKey = new Map<string, string>()
  return {
    create: (contentType) => {
      if (!contentType) return [undefined, errNoContentType]
      const key = uuid()
      contentTypeByKey.set(key, contentType)
      return [key, undefined]
    },
    get: (key) => {
      const contentType = contentTypeByKey.get(key)
      return contentType
        ? [contentType, undefined, undefined]
        : [undefined, undefined, errKeyNotFound]
    },
  }
}
