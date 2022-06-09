import {
  createPanAction,
  createResizeAction,
  createZoomAction,
  viewStateReducer,
} from './ViewState'

describe('pan', () => {
  test('when zoom is zero', () => {
    expect(
      viewStateReducer(
        { mapSize: [0, 0], offset: [0, 0], zoom: 0 },
        createPanAction({ deltaXY: [1, 2] }),
      ),
    ).toStrictEqual({
      mapSize: [0, 0],
      offset: [1, 2],
      zoom: 0,
    })
  })

  test('when zoom is one', () => {
    expect(
      viewStateReducer(
        { mapSize: [0, 0], offset: [0, 0], zoom: 1 },
        createPanAction({ deltaXY: [1, 2] }),
      ),
    ).toStrictEqual({
      mapSize: [0, 0],
      offset: [0.5, 1],
      zoom: 1,
    })
  })

  test('when zoom is two', () => {
    expect(
      viewStateReducer(
        { mapSize: [0, 0], offset: [0, 0], zoom: 2 },
        createPanAction({ deltaXY: [1, 2] }),
      ),
    ).toStrictEqual({
      mapSize: [0, 0],
      offset: [0.25, 0.5],
      zoom: 2,
    })
  })
})

describe('resize', () => {
  test('get bigger', () => {
    expect(
      viewStateReducer(
        { mapSize: [256, 256], offset: [0, 0], zoom: 0 },
        createResizeAction({
          mapSize: [512, 1024],
        }),
      ),
    ).toStrictEqual({ mapSize: [512, 1024], offset: [0, 0], zoom: 0 })
  })
})

describe('zoom', () => {
  test('into top right', () => {
    expect(
      viewStateReducer(
        { mapSize: [256, 256], offset: [0, 0], zoom: 0 },
        createZoomAction({
          deltaZ: 1,
          pointerXY: [256, 0],
        }),
      ),
    ).toStrictEqual({ mapSize: [256, 256], offset: [0.5, 0], zoom: 1 })
  })
  test('out of top right', () => {
    expect(
      viewStateReducer(
        { mapSize: [256, 256], offset: [0.5, 0], zoom: 1 },
        createZoomAction({
          deltaZ: -1,
          pointerXY: [256, 0],
        }),
      ),
    ).toStrictEqual({ mapSize: [256, 256], offset: [0, 0], zoom: 0 })
  })
  test('into bottom left', () => {
    expect(
      viewStateReducer(
        { mapSize: [256, 256], offset: [0, 0], zoom: 0 },
        createZoomAction({
          deltaZ: 1,
          pointerXY: [0, 256],
        }),
      ),
    ).toStrictEqual({ mapSize: [256, 256], offset: [0, 0.5], zoom: 1 })
  })
  test('out of bottom left', () => {
    expect(
      viewStateReducer(
        { mapSize: [256, 256], offset: [0, 0.5], zoom: 1 },
        createZoomAction({
          deltaZ: -1,
          pointerXY: [0, 256],
        }),
      ),
    ).toStrictEqual({ mapSize: [256, 256], offset: [0, 0], zoom: 0 })
  })
})
