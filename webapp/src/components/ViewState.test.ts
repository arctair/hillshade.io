import {
  createPanAction,
  createZoomAction,
  viewStateReducer,
} from './ViewState'

describe('pan', () => {
  test('when zoom is zero', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 0 },
        createPanAction({ deltaXY: [1, 2] }),
      ),
    ).toStrictEqual({
      offset: [1, 2],
      zoom: 0,
    })
  })

  test('when zoom is one', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 1 },
        createPanAction({ deltaXY: [1, 2] }),
      ),
    ).toStrictEqual({
      offset: [0.5, 1],
      zoom: 1,
    })
  })

  test('when zoom is two', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 2 },
        createPanAction({ deltaXY: [1, 2] }),
      ),
    ).toStrictEqual({
      offset: [0.25, 0.5],
      zoom: 2,
    })
  })
})

describe('zoom', () => {
  test('in', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 1 },
        createZoomAction({ deltaZ: 1 }),
      ),
    ).toStrictEqual({ offset: [0, 0], zoom: 2 })
  })
  test('out', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 2 },
        createZoomAction({ deltaZ: -1 }),
      ),
    ).toStrictEqual({ offset: [0, 0], zoom: 1 })
  })
})
