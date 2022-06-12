export default interface ViewState {
  mapSize: [number, number]
  offset: [number, number]
  zoom: number
}

export const defaultViewState: ViewState = {
  mapSize: [1, 1],
  offset: [330 / Math.pow(2, 11), 715 / Math.pow(2, 11)],
  zoom: 11,
}

export type ViewStateAction = PanAction | ResizeAction | ZoomAction

enum ActionType {
  Pan,
  Resize,
  Zoom,
}

type PanActionProps = {
  deltaXY: [number, number]
}

interface PanAction extends PanActionProps {
  type: ActionType
}

export function createPanAction(props: PanActionProps): PanAction {
  return { ...props, type: ActionType.Pan }
}

type ResizeActionProps = {
  mapSize: [number, number]
}

interface ResizeAction extends ResizeActionProps {
  type: ActionType
}

export function createResizeAction(
  props: ResizeActionProps,
): ResizeAction {
  return { ...props, type: ActionType.Resize }
}

type ZoomActionProps = {
  deltaZ: number
  pointerXY: [number, number]
}

interface ZoomAction extends ZoomActionProps {
  type: ActionType
}

export function createZoomAction(props: ZoomActionProps): ZoomAction {
  return { ...props, type: ActionType.Zoom }
}

export function viewStateReducer(
  state: ViewState,
  action: ViewStateAction,
): ViewState {
  switch (action.type) {
    case ActionType.Pan:
      return pan(state, action as PanAction)
    case ActionType.Resize:
      return resize(state, action as ResizeAction)
    case ActionType.Zoom:
      return zoom(state, action as ZoomAction)
  }
}

function pan(
  state: ViewState,
  { deltaXY: [dx, dy] }: PanAction,
): ViewState {
  const {
    mapSize,
    offset: [x, y],
    zoom,
  } = state
  const scale = Math.pow(2, -zoom)
  return {
    mapSize,
    offset: [x + (dx / 256) * scale, y + (dy / 256) * scale],
    zoom,
  }
}

function resize(state: ViewState, { mapSize }: ResizeAction) {
  return { ...state, mapSize }
}

function zoom(
  { mapSize, offset: [x, y], zoom }: ViewState,
  { deltaZ, pointerXY: [px, py] }: ZoomAction,
): ViewState {
  const deltaScale =
    (Math.pow(2, -zoom) * (1 - Math.pow(2, -deltaZ))) / 256
  const [width, height] = mapSize
  return {
    mapSize,
    offset: [
      x + (width * deltaScale * px) / width,
      y + (height * deltaScale * py) / height,
    ],
    zoom: zoom + deltaZ,
  }
}

export function selectGLExtent2D({
  mapSize: [width, height],
  offset: [x, y],
  zoom,
}: ViewState): [number, number, number, number] {
  const [left, right] = selectGLExtent1D({ size: width, offset: x, zoom })
  const [top, bottom] = selectGLExtent1D({ size: height, offset: y, zoom })
  return [left, right, bottom, top]
}

export function selectGLExtent1D({
  size,
  offset,
  zoom,
}: {
  size: number
  offset: number
  zoom: number
}): [number, number] {
  const zTileSize = Math.pow(2, -Math.floor(zoom))
  const glStart = modabove(offset, zTileSize) / zTileSize
  const glSize = size / 256 / Math.pow(2, modabove(zoom))
  return [glStart, glStart + glSize]
}

function modabove(value: number, threshold = 1) {
  return ((value % threshold) + threshold) % threshold
}

export function selectTileExtent2D({
  mapSize: [width, height],
  offset: [x, y],
  zoom,
}: ViewState): [number, number, number, number] {
  const [left, right] = selectTileExtent1D({
    size: width,
    offset: x,
    zoom,
  })
  const [top, bottom] = selectTileExtent1D({
    size: height,
    offset: y,
    zoom,
  })
  return [left, right, bottom, top]
}

export function selectTileExtent1D({
  size,
  offset,
  zoom,
}: {
  size: number
  offset: number
  zoom: number
}) {
  const tileCount = Math.pow(2, Math.floor(zoom))
  const offsetFloor = Math.floor(offset * tileCount)
  return [offsetFloor, offsetFloor + size / 256 + 1]
}
