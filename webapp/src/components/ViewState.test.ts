import ViewState, {
  createPanAction,
  createResizeAction,
  createZoomAction,
  MAX_3857_X,
  MAX_3857_Y,
  selectExtent,
  selectGLExtent1D,
  selectTileExtent1D,
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
  test('full offset by full zoomed z-tile', () => {
    const view = { size: 1024, offset: 0.5, zoom: 1 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4]
    expect(actual).toStrictEqual(expected)
  })
  test('partial offset by full zoomed z-tile', () => {
    const view = { size: 1024, offset: 0.25, zoom: 1 }
    const actual = selectGLExtent1D(view)
    const expected = [0.5, 4.5]
    expect(actual).toStrictEqual(expected)
  })
  test('full zoom level', () => {
    const view = { size: 1024, offset: 0, zoom: 1 }
    const actual = selectGLExtent1D(view)
    const expected = [0, 4]
    expect(actual).toStrictEqual(expected)
  })
})

describe('selectTileExtent1D', () => {
  test('default view', () => {
    const view = { size: 1024, offset: 0, zoom: 0 }
    const actual = selectTileExtent1D(view)
    const expected = [0, 5]
    expect(actual).toStrictEqual(expected)
  })
  test('partial zoom level', () => {
    const view = { size: 1024, offset: 0, zoom: 0.75 }
    const actual = selectTileExtent1D(view)
    const expected = [0, 5]
    expect(actual).toStrictEqual(expected)
  })
  test('different screen size', () => {
    const view = { size: 3840, offset: 0, zoom: 0 }
    const actual = selectTileExtent1D(view)
    const expected = [0, 3840 / 256 + 1]
    expect(actual).toStrictEqual(expected)
  })
  test('offset by partial z-tile', () => {
    const view = { size: 1024, offset: 0.5, zoom: 0 }
    const actual = selectTileExtent1D(view)
    const expected = [0, 5]
    expect(actual).toStrictEqual(expected)
  })
  test('offset by full z-tile', () => {
    const view = { size: 1024, offset: 0.99, zoom: 1.99 }
    const actual = selectTileExtent1D(view)
    const expected = [1, 6]
    expect(actual).toStrictEqual(expected)
  })
})

describe('selectExtent', () => {
  test('map extent is twice wide half tall as world extent', () => {
    const view: ViewState = {
      mapSize: [512, 128],
      offset: [0, 0],
      zoom: 0,
    }
    const actual = selectExtent(view)
    const expected = {
      left: -MAX_3857_X,
      top: -MAX_3857_Y,
      right: MAX_3857_X * 3,
      bottom: 0,
    }
    expect(actual).toEqual(expected)
  })
  test('map extent matches world extent', () => {
    const view: ViewState = {
      mapSize: [256, 256],
      offset: [0, 0],
      zoom: 0,
    }
    const actual = selectExtent(view)
    const expected = {
      left: -MAX_3857_X,
      top: -MAX_3857_Y,
      right: MAX_3857_X,
      bottom: MAX_3857_Y,
    }
    expect(actual).toEqual(expected)
  })
  test('map extent offset from world extent', () => {
    const view: ViewState = {
      mapSize: [256, 256],
      offset: [1, 1],
      zoom: 0,
    }
    const actual = selectExtent(view)
    const expected = {
      left: 0,
      top: 0,
      right: MAX_3857_X * 2,
      bottom: MAX_3857_Y * 2,
    }
    expect(actual).toEqual(expected)
  })
  test('map extent is one quarter of world extent', () => {
    const view: ViewState = {
      mapSize: [256, 256],
      offset: [0, 0],
      zoom: 1,
    }
    const actual = selectExtent(view)
    const expected = {
      left: -MAX_3857_X,
      top: -MAX_3857_Y,
      right: 0,
      bottom: 0,
    }
    expect(actual).toEqual(expected)
  })
})
