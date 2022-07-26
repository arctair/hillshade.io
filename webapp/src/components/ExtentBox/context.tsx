import { createContext, useContext, useReducer } from 'react'
import { Action, State } from './types'

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
      const { event, rect } = action
      const x = event.clientX - rect.x
      const y = event.clientY - rect.y
      return {
        dragging: true,
        rectangle: [x, y, x, y],
        startSelect: false,
      }
    }
    case 'pointerMove': {
      if (!state.dragging) return state
      const [x0, y0] = state.rectangle
      const { event, rect } = action
      const x = event.clientX - rect.x
      const y = event.clientY - rect.y
      return { ...state, rectangle: [x0, y0, x, y] }
    }
    case 'pointerUp':
      return { ...state, dragging: false }
    case 'startSelect':
      return { ...state, startSelect: true }
  }
}

export function useExtentBox(): [State, ExtentBoxDispatchers] {
  const [state, dispatch] = useContext(context)
  return [
    state,
    {
      pointerDown: ({ event, rect }) =>
        dispatch({ event, rect, type: 'pointerDown' }),
      pointerMove: ({ event, rect }) =>
        dispatch({ event, rect, type: 'pointerMove' }),
      pointerUp: () => dispatch({ type: 'pointerUp' }),
      startSelect: () => dispatch({ type: 'startSelect' }),
    },
  ]
}

interface ExtentBoxDispatchers {
  pointerDown: (action: {
    event: React.PointerEvent
    rect: DOMRect
  }) => void
  pointerMove: (action: {
    event: React.PointerEvent
    rect: DOMRect
  }) => void
  pointerUp: () => void
  startSelect: () => void
}
