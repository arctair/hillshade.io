import ViewState from '../ViewState'

export type State = {
  dragging: boolean
  startSelect: boolean
  rectangle?: [number, number, number, number]
}

export type Action =
  | PointerDownAction
  | PointerMoveAction
  | PointerUpAction
  | StartSelectAction

export interface PointerDownProps {
  position: [number, number]
  viewState: ViewState
}

interface PointerDownAction extends PointerDownProps {
  type: 'pointerDown'
}

export interface PointerMoveProps {
  position: [number, number]
  viewState: ViewState
}

interface PointerMoveAction extends PointerMoveProps {
  type: 'pointerMove'
}

interface PointerUpAction {
  type: 'pointerUp'
}

interface StartSelectAction {
  type: 'startSelect'
}
