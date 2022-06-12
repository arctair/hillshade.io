import {
  createPanAction,
  createResizeAction,
  createZoomAction,
  selectGLExtent1D,
  viewStateReducer,
} from './ViewState'

describe('pan', () => {
  test('when zoom is zero', () => {
    expect(
      viewStateReducer(
        { mapSize: [1920, 1080], offset: [0, 0], zoom: 0 },
        createPanAction({ deltaXY: [-256, 512] }),
      ),
    ).toStrictEqual({
      mapSize: [1920, 1080],
      offset: [-1, 2],
      zoom: 0,
    })
  })

  test('when zoom is one quarter', () => {
    expect(
      viewStateReducer(
        { mapSize: [1920, 1080], offset: [1, 0], zoom: 0.25 },
        createPanAction({ deltaXY: [256 * Math.pow(2, 0.25), 0] }),
      ),
    ).toStrictEqual({
      mapSize: [1920, 1080],
      offset: [2, 0],
      zoom: 0.25,
    })
  })

  test('when zoom is one', () => {
    expect(
      viewStateReducer(
        { mapSize: [1920, 1080], offset: [0, 0], zoom: 1 },
        createPanAction({ deltaXY: [-128, 256] }),
      ),
    ).toStrictEqual({
      mapSize: [1920, 1080],
      offset: [-0.25, 0.5],
      zoom: 1,
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

describe('selectGLExtent1D', () => {
  test('default view', () => {
    const view = { size: 1024, offset: 0, zoom: 0 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4]
    expect(actual).toStrictEqual(expected)
  })
  test('partial zoom level', () => {
    const view = { size: 1024, offset: 1, zoom: 0.25 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4 / Math.pow(2, 0.25)]
    expect(actual).toStrictEqual(expected)
  })
  test('full zoom level', () => {
    const view = { size: 1024, offset: 0, zoom: 1 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4]
    expect(actual).toStrictEqual(expected)
  })
  test('different screen size', () => {
    const view = { size: 3840, offset: 0, zoom: 0.25 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 3840 / 256 / Math.pow(2, 0.25)]
    expect(actual).toStrictEqual(expected)
  })
  test('offset by partial z-tile', () => {
    const view = { size: 1024, offset: 0.5, zoom: 0 }
    const actual = selectGLExtent1D(view)
    const expected = [0.5, 4.5]
    expect(actual).toStrictEqual(expected)
  })
  test('offset by full z-tile', () => {
    const view = { size: 1024, offset: 1, zoom: 0 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4]
    expect(actual).toStrictEqual(expected)
  })
  test('offset by full zoomed z-tile', () => {
    const view = { size: 1024, offset: 0.5, zoom: 1 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4]
    expect(actual).toStrictEqual(expected)
  })
})
