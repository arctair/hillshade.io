import { useExtentBox } from './ExtentBox/context'
import { TILE_TO_EPSG_3857, transformExtent } from './transformations'
import { KeyedLayout, Layout, selectWorldScreenResolution } from './types'
import { useViewState } from './ViewState'
import { selectLayout } from './ViewState/selectors'

export function LayoutSummary() {
  const [{ rectangle }] = useExtentBox()
  const [viewState] = useViewState()
  const layout = selectLayout(viewState, TILE_TO_EPSG_3857)
  const extent = rectangle
    ? transformExtent(rectangle, TILE_TO_EPSG_3857)
    : layout.extent
  return (
    <>
      <ExtentSummary extent={extent} />
      <SizeSummary size={layout.size} />
      <WorldScreenResolutionSummary layout={layout} />
    </>
  )
}

interface ExtentSummaryProps {
  extent: [number, number, number, number]
}
export function ExtentSummary({ extent }: ExtentSummaryProps) {
  return (
    <div>
      extent: [ {extent.map((v) => v.toFixed(0)).join(' ')} ] (EPSG:3857)
    </div>
  )
}

interface SizeSummaryProps {
  size: [number, number]
}
export function SizeSummary({ size }: SizeSummaryProps) {
  return <div>size: {size.join('x')}</div>
}

interface WorldScreenResolutionSummaryProps {
  layout: Layout
}
export function WorldScreenResolutionSummary({
  layout,
}: WorldScreenResolutionSummaryProps) {
  const worldScreenResolution = selectWorldScreenResolution(layout)
    .map((v) => v.toFixed(2))
    .join('x')
  return (
    <div>
      world screen resolution: {worldScreenResolution} meters/pixel
    </div>
  )
}

interface KeyedLayoutSummaryProps {
  layout?: KeyedLayout
}
export function KeyedLayoutSummary({ layout }: KeyedLayoutSummaryProps) {
  return layout ? (
    <>
      <div>key: {layout.key}</div>
      <ExtentSummary extent={layout.extent} />
      <SizeSummary size={layout.size} />
      <WorldScreenResolutionSummary layout={layout} />
      <a
        style={{
          display: 'block',
          visibility: layout.attachments.heightmapURL
            ? 'visible'
            : 'hidden',
        }}
        href={layout.attachments.heightmapURL}
      >
        heightmap
      </a>
      <a
        style={{
          display: 'block',
          visibility: layout.attachments.heightmapPreviewURL
            ? 'visible'
            : 'hidden',
        }}
        href={layout.attachments.heightmapPreviewURL}
      >
        preview
      </a>
    </>
  ) : null
}
