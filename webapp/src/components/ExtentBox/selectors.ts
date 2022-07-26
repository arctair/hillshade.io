import { State } from './types'

export const selectActive = ({ dragging, startSelect }: State) =>
  dragging || startSelect
