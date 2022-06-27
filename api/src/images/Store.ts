export default function Store() {
  return {
    create: (contentType: string) => [
      undefined,
      `dummy image store got content type ${contentType}`,
    ],
  }
}
