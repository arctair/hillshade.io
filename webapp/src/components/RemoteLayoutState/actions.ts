import { KeyedLayout, Layout } from '../types'

export type Action = CreateStart | CreateSuccess | CreateFailure | Forget
export enum ActionType {
  CreateStart,
  CreateSuccess,
  CreateFailure,
  Forget,
  HeightmapURLAvailable,
}

interface CreateStartProps {
  layout: Layout
}
export interface CreateStart extends CreateStartProps {
  type: ActionType
}

interface CreateSuccessProps {
  layout: KeyedLayout
  timer: NodeJS.Timer
}
export interface CreateSuccess extends CreateSuccessProps {
  type: ActionType
}

interface CreateFailureProps {
  errors: string[]
}
export interface CreateFailure extends CreateFailureProps {
  type: ActionType
}

export interface Forget {
  type: ActionType
}

export interface HeightmapURLAvailableProps {
  layout: KeyedLayout
}
export interface HeightmapURLAvailable extends HeightmapURLAvailableProps {
  type: ActionType
}
