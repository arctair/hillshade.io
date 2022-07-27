import { useRemoteLayoutState } from './RemoteLayoutState'

export default function Preview() {
  const [{ layout }] = useRemoteLayoutState()
  const heightmapURL = layout?.attachments.heightmapPreviewURL

  return <img src={heightmapURL} alt="" />
}
