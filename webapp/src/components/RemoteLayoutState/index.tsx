import React, { useContext, useReducer } from 'react'
import { KeyedLayout } from '../types'
import ViewState, { useViewState } from '../ViewState'
import { selectLayout } from '../ViewState/selectors'
import { TILE_TO_EPSG_3857, transformExtent } from '../transformations'
import {
  ActionType,
  Action,
  CreateFailure,
  CreateStart,
  CreateSuccess,
  Forget,
  HeightmapURLAvailable,
} from './actions'

const defaultState = { errors: [], layout: undefined }
interface State {
  errors: string[]
  layout?: KeyedLayout
  timer?: NodeJS.Timer
}

interface ContextOperations {
  createLayout: () => void
  forgetLayout: () => void
}

const errNoContextProvider = 'no context provider in tree'
const Context = React.createContext<[State, ContextOperations]>([
  defaultState,
  {
    createLayout: () => console.error(errNoContextProvider),
    forgetLayout: () => console.error(errNoContextProvider),
  },
])

export function useRemoteLayoutState() {
  return useContext(Context)
}

interface RemoteLayoutProviderProps {
  children: React.ReactNode
}
export function RemoteLayoutProvider({
  children,
}: RemoteLayoutProviderProps) {
  const [viewState] = useViewState()
  const [state, dispatch] = useReducer(reducer, defaultState)
  return (
    <Context.Provider
      children={children}
      value={[
        state,
        {
          createLayout: () => createLayout(dispatch, state, viewState),
          forgetLayout: () => dispatch({ type: ActionType.Forget }),
        },
      ]}
    />
  )
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.CreateStart:
      return reduceCreateStart(state, action as CreateStart)
    case ActionType.CreateSuccess:
      return reduceCreateSuccess(state, action as CreateSuccess)
    case ActionType.CreateFailure:
      return reduceCreateFailure(state, action as CreateFailure)
    case ActionType.Forget:
      return reduceForget(state, action as Forget)
    case ActionType.HeightmapURLAvailable:
      return reduceHeightmapURLAvailable(
        state,
        action as HeightmapURLAvailable,
      )
  }
}

function reduceCreateStart(state: State, action: CreateStart) {
  return { errors: [] }
}

function reduceCreateSuccess(_: State, action: CreateSuccess) {
  return { errors: [], layout: action.layout, timer: action.timer }
}

function reduceCreateFailure(_: State, action: CreateFailure) {
  return { errors: action.errors }
}

function reduceForget(_: State, action: Forget) {
  return { errors: [] }
}

function reduceHeightmapURLAvailable(
  _: State,
  action: HeightmapURLAvailable,
) {
  return { errors: [], layout: action.layout }
}

async function createLayout(
  dispatch: React.Dispatch<Action>,
  { timer }: State,
  viewState: ViewState,
) {
  clearInterval(timer)

  const layout = selectLayout(viewState)
  layout.extent = transformExtent(layout.extent, TILE_TO_EPSG_3857)

  dispatch({ type: ActionType.CreateStart, layout })
  const response = await fetch('https://api.hillshade.io', {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(layout),
  })
  if (response.status !== 201) {
    const { errors } = await response.json()
    dispatch({ type: ActionType.CreateFailure, errors })
  } else {
    const layout = await response.json()
    const timer = setInterval(async () => {
      const response = await fetch(
        `https://api.hillshade.io/layouts/${layout.key}`,
      )
      const updatedLayout = await response.json()
      if (updatedLayout.attachments.heightmapPreviewURL) {
        clearInterval(timer)
        dispatch({
          type: ActionType.HeightmapURLAvailable,
          layout: updatedLayout,
        })
      }
    }, 1000)
    dispatch({
      type: ActionType.CreateSuccess,
      layout,
      timer,
    })
  }
}
