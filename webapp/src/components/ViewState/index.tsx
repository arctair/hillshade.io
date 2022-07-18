import React, { useContext, useReducer } from 'react'
import {
  Action,
  ActionType,
  PanAction,
  ResizeAction,
  ZoomAction,
} from './actions'

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

export function viewStateReducer(
  state: ViewState,
  action: Action,
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

const context = React.createContext<[ViewState, React.Dispatch<Action>]>([
  defaultViewState,
  (_: Action) => {},
])

type ProviderProps = { children: React.ReactNode }
export function Provider({ children }: ProviderProps) {
  const [viewState, dispatch] = useReducer(
    viewStateReducer,
    defaultViewState,
  )
  return (
    <context.Provider children={children} value={[viewState, dispatch]} />
  )
}

export function useViewState() {
  return useContext(context)
}
