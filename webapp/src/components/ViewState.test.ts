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
  test('into top right', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 0 },
        createZoomAction({
          deltaZ: 1,
          mapSize: [256, 256],
          pointerXY: [256, 0],
        }),
      ),
    ).toStrictEqual({ offset: [0.5, 0], zoom: 1 })
  })
  test('out of top right', () => {
    expect(
      viewStateReducer(
        { offset: [0.5, 0], zoom: 1 },
        createZoomAction({
          deltaZ: -1,
          mapSize: [256, 256],
          pointerXY: [256, 0],
        }),
      ),
    ).toStrictEqual({ offset: [0, 0], zoom: 0 })
  })
  test('into bottom left', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 0 },
        createZoomAction({
          deltaZ: 1,
          mapSize: [256, 256],
          pointerXY: [0, 256],
        }),
      ),
    ).toStrictEqual({ offset: [0, 0.5], zoom: 1 })
  })
  test('out of bottom left', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0.5], zoom: 1 },
        createZoomAction({
          deltaZ: -1,
          mapSize: [256, 256],
          pointerXY: [0, 256],
        }),
      ),
    ).toStrictEqual({ offset: [0, 0], zoom: 0 })
  })
})
