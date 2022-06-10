export default interface ViewState {
  mapSize: [number, number]
  offset: [number, number]
  zoom: number
}

export const defaultViewState: ViewState = {
  mapSize: [1, 1],
  offset: [0, 0],
  zoom: 0,
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

type Extent = [number, number, number, number]
export function selectGLExtent({
  mapSize: [width, height],
  offset: [left, top],
  zoom,
}: ViewState): Extent {
  const scaleMod = Math.pow(2, shiftmod(zoom))
  const glTileSize = Math.pow(2, -zoom)
  const glLeft = shiftmod(left / glTileSize)
  const glTop = shiftmod(top / glTileSize)
  return [
    glLeft,
    glLeft + width / 256 / scaleMod,
    glTop + height / 256 / scaleMod,
    glTop,
  ]
}

function shiftmod(value: number) {
  return ((value % 1) + 1) % 1
}
