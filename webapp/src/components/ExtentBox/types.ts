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

interface PointerDownAction {
  type: 'pointerDown'
  event: React.PointerEvent<any>
  rect: DOMRect
}

interface PointerMoveAction {
  type: 'pointerMove'
  event: React.PointerEvent<any>
  rect: DOMRect
}

interface PointerUpAction {
  type: 'pointerUp'
}

interface StartSelectAction {
  type: 'startSelect'
}
