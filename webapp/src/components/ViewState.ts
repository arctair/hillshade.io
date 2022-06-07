export default interface ViewState {
  offset: [number, number]
  zoom: number
}

export const defaultViewState: ViewState = {
  offset: [330 / Math.pow(2, 11), 715 / Math.pow(2, 11)],
  zoom: 11,
}

export function viewStateReducer(
  state: ViewState,
  action: any,
): ViewState {
  switch (action.type) {
    case 'pan':
      const {
        offset: [x, y],
        zoom,
      } = state
      const scale = Math.pow(2, zoom)
      const [dx, dy] = action.deltaXY
      return { ...state, offset: [x + dx / scale, y + dy / scale] }
    case 'zoom':
      return { ...state, zoom: state.zoom + action.deltaZ }
    default:
      throw Error(
        `action of type '${action.type}' is irreducible because it is unknown`,
      )
  }
}
