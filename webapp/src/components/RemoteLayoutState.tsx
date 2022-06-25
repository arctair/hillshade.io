import React, { useContext, useReducer } from 'react'
import { KeyedLayout, Layout } from './types'
import ViewState, { selectLayout, useViewState } from './ViewState'
import { TILE_TO_EPSG_3857, transformExtent } from './transformations'

type Action = CreateStart | CreateSuccess | CreateFailure
enum ActionType {
  CreateStart,
  CreateSuccess,
  CreateFailure,
  HeightmapURLAvailable,
}

const defaultState = { errors: [], layout: undefined }
interface State {
  errors: string[]
  layout?: KeyedLayout
  timer?: NodeJS.Timer
}

interface ContextOperations {
  createLayout: () => void
}

const Context = React.createContext<[State, ContextOperations]>([
  defaultState,
  { createLayout: () => console.error('no context provider in tree') },
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
        { createLayout: () => createLayout(dispatch, state, viewState) },
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
      const response = await fetch('https://api.hillshade.io')
      const { layouts }: { layouts: KeyedLayout[] } = await response.json()
      const updatedLayout = layouts.find(({ key }) => key === layout.key)!
      if (updatedLayout.heightmapURL) {
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

interface CreateStartProps {
  layout: Layout
}
interface CreateStart extends CreateStartProps {
  type: ActionType
}
interface CreateSuccessProps {
  layout: KeyedLayout
  timer: NodeJS.Timer
}
interface CreateSuccess extends CreateSuccessProps {
  type: ActionType
}
interface CreateFailureProps {
  errors: string[]
}
interface CreateFailure extends CreateFailureProps {
  type: ActionType
}

interface HeightmapURLAvailableProps {
  layout: KeyedLayout
}
interface HeightmapURLAvailable extends HeightmapURLAvailableProps {
  type: ActionType
}
