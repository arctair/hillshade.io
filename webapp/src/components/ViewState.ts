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

export interface PanAction {
  type: ActionType
  deltaXY: [number, number]
}

export function createPanAction({
  deltaXY,
}: {
  deltaXY: [number, number]
}): PanAction {
  return {
    type: ActionType.Pan,
    deltaXY,
  }
}

export interface ZoomAction {
  type: ActionType
  deltaZ: number
}

export function createZoomAction({
  deltaZ,
}: {
  deltaZ: number
}): ZoomAction {
  return {
    type: ActionType.Zoom,
    deltaZ,
  }
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

function zoom(state: ViewState, { deltaZ }: ZoomAction): ViewState {
  return { ...state, zoom: state.zoom + deltaZ }
}
