import React, { useContext, useReducer } from 'react'
import { KeyedLayout, Layout } from './types'
import ViewState, { selectExtent, useViewState } from './ViewState'

type Action = CreateStart | CreateSuccess | CreateFailure
enum ActionType {
  CreateStart,
  CreateSuccess,
  CreateFailure,
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
        { createLayout: () => createLayout(dispatch, viewState) },
      ]}
    />
  )
}

async function createLayout(
  dispatch: React.Dispatch<Action>,
  viewState: ViewState,
) {
  const layout = {
    size: viewState.mapSize,
    extent: selectExtent(viewState),
  }
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
    dispatch({
      type: ActionType.CreateSuccess,
      layout: await response.json(),
    })
  }
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case ActionType.CreateStart:
      return createStart(state, action as CreateStart)
    case ActionType.CreateSuccess:
      return createSuccess(state, action as CreateSuccess)
    case ActionType.CreateFailure:
      return createFailure(state, action as CreateFailure)
  }
}

interface State {
  errors: string[]
  layout?: Layout
}
const defaultState = { errors: [], layout: undefined }

interface CreateStartProps {
  layout: Layout
}
interface CreateStart extends CreateStartProps {
  type: ActionType
}
function createStart(_: State, action: CreateStart) {
  return { errors: [], layout: action.layout }
}

interface CreateSuccessProps {
  layout: KeyedLayout
}
interface CreateSuccess extends CreateSuccessProps {
  type: ActionType
}
function createSuccess(_: State, action: CreateSuccess) {
  return { errors: [], layout: action.layout }
}

interface CreateFailureProps {
  errors: string[]
}
interface CreateFailure extends CreateFailureProps {
  type: ActionType
}
function createFailure(_: State, action: CreateFailure) {
  return { errors: action.errors, layout: undefined }
}

interface ContextOperations {
  createLayout: () => void
}
const Context = React.createContext<[State, ContextOperations]>([
  defaultState,
  { createLayout: () => {} },
])

export function useRemoteLayoutState() {
  return useContext(Context)
}
