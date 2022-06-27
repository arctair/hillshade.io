export const errNoContentType =
  'Uploaded images must have a content-type header'

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
  }
}
