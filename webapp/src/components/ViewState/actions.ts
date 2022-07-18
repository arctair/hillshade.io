export type Action = PanAction | ResizeAction | ZoomAction

export enum ActionType {
  Pan,
  Resize,
  Zoom,
}

type PanActionProps = {
  deltaXY: [number, number]
}

export interface PanAction extends PanActionProps {
  type: ActionType
}

export function createPanAction(props: PanActionProps): PanAction {
  return { ...props, type: ActionType.Pan }
}

type ResizeActionProps = {
  mapSize: [number, number]
}

export interface ResizeAction extends ResizeActionProps {
  type: ActionType
}

export function createResizeAction(
  props: ResizeActionProps,
): ResizeAction {
  return { ...props, type: ActionType.Resize }
}

type ZoomActionProps = {
  deltaZ: number
  pointerXY: [number, number]
}

export interface ZoomAction extends ZoomActionProps {
  type: ActionType
}

export function createZoomAction(props: ZoomActionProps): ZoomAction {
  return { ...props, type: ActionType.Zoom }
}
