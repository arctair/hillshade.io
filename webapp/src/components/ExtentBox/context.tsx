import { createContext, useContext, useReducer } from 'react'
import ViewState from '../ViewState'
import { Action, PointerDownProps, PointerMoveProps, State } from './types'

const defaultState = {
  dragging: false,
  startSelect: false,
  rectangle: [0, 0, 0, 0],
} as State

export const context = createContext([
  defaultState,
  (_: Action) => {
    throw Error(`no extent box provider in component tree`)
  },
] as [State, React.Dispatch<Action>])

interface ProviderProps {
  children: React.ReactNode
}
export function Provider({ children }: ProviderProps) {
  const value = useReducer(reducer, defaultState)
  return <context.Provider value={value} children={children} />
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'pointerDown': {
      if (!state.startSelect) return state
      const { event, rect, viewState } = action
      const [x, y] = selectOffsetFromScreen(viewState, [
        event.clientX - rect.x,
        event.clientY - rect.y,
      ])
      return {
        dragging: true,
        rectangle: [x, y, x, y],
        startSelect: false,
      }
    }
    case 'pointerMove': {
      if (!state.dragging) return state
      const [x0, y0] = state.rectangle
      const { event, rect, viewState } = action
      const [x, y] = selectOffsetFromScreen(viewState, [
        event.clientX - rect.x,
        event.clientY - rect.y,
      ])
      return { ...state, rectangle: [x0, y0, x, y] }
    }
    case 'pointerUp':
      return { ...state, dragging: false }
    case 'startSelect':
      return { ...state, startSelect: true }
  }
}

function selectOffsetFromScreen(
  { offset: [ox, oy], zoom }: ViewState,
  [sx, sy]: [number, number],
): [number, number] {
  const scale = Math.pow(2, zoom)
  return [ox + sx / 256 / scale, oy + sy / 256 / scale]
}

export function useExtentBox(): [State, ExtentBoxDispatchers] {
  const [state, dispatch] = useContext(context)
  return [
    state,
    {
      pointerDown: (props) => dispatch({ ...props, type: 'pointerDown' }),
      pointerMove: (props) => dispatch({ ...props, type: 'pointerMove' }),
      pointerUp: () => dispatch({ type: 'pointerUp' }),
      startSelect: () => dispatch({ type: 'startSelect' }),
    },
  ]
}

interface ExtentBoxDispatchers {
  pointerDown: (_: PointerDownProps) => void
  pointerMove: (_: PointerMoveProps) => void
  pointerUp: () => void
  startSelect: () => void
}
