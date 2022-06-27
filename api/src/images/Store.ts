export const errNoContentType =
  'Uploaded images must have a content-type header'
export const errKeyNotFound = 'That image key is not present'

export type Store = {
  create: (contentType: string) => [string?, string?]
  get: (key: string) => [string?, string?]
}
export default function Store(): Store {
  return {
    create: (contentType) => [
      undefined,
      `dummy image store got content type ${contentType}`,
    ],
    get: (key) => [undefined, `dummy image store cannot get key ${key}`],
  }
}
