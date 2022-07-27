import { createContext, useContext, useReducer } from 'react'
import { Action, PointerDownProps, PointerMoveProps, State } from './types'

const defaultState = {
  dragging: false,
  startSelect: false,
  rectangle: undefined,
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
      const [x, y] = offset(action)
      return {
        dragging: true,
        rectangle: [x, y, x, y],
        startSelect: false,
      }
    }
    case 'pointerMove': {
      if (!state.dragging) return state
      const [x0, y0] = state.rectangle!
      const [x, y] = offset(action)
      return { ...state, rectangle: [x0, y0, x, y] }
    }
    case 'pointerUp':
      return { ...state, dragging: false }
    case 'startSelect':
      return { ...state, startSelect: true }
  }
}

function offset({
  viewState: {
    offset: [ox, oy],
    zoom,
  },
  position: [sx, sy],
}: PointerDownProps | PointerMoveProps): [number, number] {
  const scale = Math.pow(2, zoom)
  return [ox + sx / 256 / scale, oy + sy / 256 / scale]
}

export function useExtentBox(): [State, ExtentBoxDispatchers] {
  const [{ rectangle, ...state }, dispatch] = useContext(context)
  return [
    {
      ...state,
      rectangle: rectangle ? selectExtent(rectangle) : undefined,
    },
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

const selectExtent = ([x0, y0, x1, y1]: [
  number,
  number,
  number,
  number,
]): [number, number, number, number] => [
  Math.min(x0, x1),
  Math.min(y0, y1),
  Math.max(x0, x1),
  Math.max(y0, y1),
]
