export type State = {
  dragging: boolean
  startSelect: boolean
  rectangle: [number, number, number, number]
}

export type Action =
  | PointerDownAction
  | PointerMoveAction
  | PointerUpAction
  | StartSelectAction

export interface PointerDownProps {
  event: React.PointerEvent
  rect: DOMRect
}

interface PointerDownAction extends PointerDownProps {
  type: 'pointerDown'
}

export interface PointerMoveProps {
  event: React.PointerEvent
  rect: DOMRect
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
