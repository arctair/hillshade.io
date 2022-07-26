import { createContext, useReducer } from 'react'
import { State } from './types'

const defaultState = { dragging: false, rectangle: [0, 0, 0, 0] } as State

export const context = createContext([
  defaultState,
  (_: any) => {
    throw Error(`no extent box provider in component tree`)
  },
] as [State, React.Dispatch<any>])

interface ProviderProps {
  children: React.ReactNode
}
export function Provider({ children }: ProviderProps) {
  const value = useReducer(reducer, defaultState)
  return <context.Provider value={value} children={children} />
}

function reducer(state: State, { event, rect, type }: any): State {
  if (type === 'onPointerDown') {
    const x = event.clientX - rect.x
    const y = event.clientY - rect.y
    return { dragging: true, rectangle: [x, y, x, y] }
  } else if (type === 'onPointerMove') {
    const {
      dragging,
      rectangle: [x0, y0],
    } = state
    if (dragging) {
      const x = event.clientX - rect.x
      const y = event.clientY - rect.y
      return { ...state, rectangle: [x0, y0, x, y] }
    } else return state
  } else if (type === 'onPointerUp') {
    return { ...state, dragging: false }
  } else throw Error(`irreducible action type: ${type}`)
}
