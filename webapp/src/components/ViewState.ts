export default interface ViewState {
  offset: [number, number]
  zoom: number
}

export const defaultViewState: ViewState = {
  offset: [330 / Math.pow(2, 11), 715 / Math.pow(2, 11)],
  zoom: 11,
}

enum ActionType {
  Pan,
  Zoom,
}

type PanActionProps = {
  deltaXY: [number, number]
}

export interface PanAction extends PanActionProps {
  type: ActionType
}

export function createPanAction(props: PanActionProps): PanAction {
  return { ...props, type: ActionType.Pan }
}

type ZoomActionProps = {
  deltaZ: number
  mapSize: [number, number]
  pointerXY: [number, number]
}

export interface ZoomAction extends ZoomActionProps {
  type: ActionType
}

export function createZoomAction(props: ZoomActionProps): ZoomAction {
  return { ...props, type: ActionType.Zoom }
}

export function viewStateReducer(
  state: ViewState,
  action: PanAction | ZoomAction,
): ViewState {
  switch (action.type) {
    case ActionType.Pan:
      return pan(state, action as PanAction)
    case ActionType.Zoom:
      return zoom(state, action as ZoomAction)
  }
}

function pan(
  state: ViewState,
  { deltaXY: [dx, dy] }: PanAction,
): ViewState {
  const {
    offset: [x, y],
    zoom,
  } = state
  const scale = Math.pow(2, -zoom)
  return { ...state, offset: [x + dx * scale, y + dy * scale] }
}

function zoom(
  { offset: [x, y], zoom }: ViewState,
  { deltaZ, mapSize: [width, height], pointerXY: [px, py] }: ZoomAction,
): ViewState {
  const deltaScale =
    (Math.pow(2, -zoom) * (1 - Math.pow(2, -deltaZ))) / 256
  return {
    offset: [
      x + (width * deltaScale * px) / width,
      y + (height * deltaScale * py) / height,
    ],
    zoom: zoom + deltaZ,
  }
}
