import { createContext, useContext, useReducer } from 'react'
import { State } from './types'
import { Action } from './actions'

const defaultState = {
  dragging: false,
  startSelect: false,
  rectangle: [0, 0, 0, 0],
} as State

export const context = createContext([
  defaultState,
  (_: any) => {
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
  if (action.type === 'pointerDown') {
    if (state.startSelect) {
      const { event, rect } = action
      const x = event!.clientX - rect!.x
      const y = event!.clientY - rect!.y
      return {
        dragging: true,
        rectangle: [x, y, x, y],
        startSelect: false,
      }
    } else return state
  } else if (action.type === 'pointerMove') {
    const {
      dragging,
      rectangle: [x0, y0],
    } = state
    if (dragging) {
      const { event, rect } = action
      const x = event!.clientX - rect!.x
      const y = event!.clientY - rect!.y
      return { ...state, rectangle: [x0, y0, x, y] }
    } else return state
  } else if (action.type === 'pointerUp') {
    return { ...state, dragging: false }
  } else if (action.type === 'startSelect') {
    return { ...state, startSelect: true }
  } else throw Error(`irreducible action type`)
}

export function useExtentBox() {
  const [state, dispatch] = useContext(context)
  return [
    state,
    { startSelect: () => dispatch({ type: 'startSelect' }) },
  ] as [State, any]
}
