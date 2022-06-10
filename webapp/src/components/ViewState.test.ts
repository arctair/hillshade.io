import ViewState, {
  createPanAction,
  createResizeAction,
  createZoomAction,
  selectGLExtent,
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

describe('selectGLExtent', () => {
  test('select default gl extent', () => {
    expect(
      selectGLExtent({ mapSize: [1920, 1080], offset: [0, 0], zoom: 0 }),
    ).toStrictEqual([0, 1920 / 256, 1080 / 256, 0])
  })
  test('select offset gl extent', () => {
    expect(
      selectGLExtent({
        mapSize: [1920, 1080],
        offset: [1.5, 2.75],
        zoom: 0,
      }),
    ).toStrictEqual([0.5, 0.5 + 1920 / 256, 0.75 + 1080 / 256, 0.75])
  })
  test('select offset zoomed gl extent', () => {
    expect(
      selectGLExtent({
        mapSize: [1920, 1080],
        offset: [0.75, 1.25],
        zoom: 1,
      }),
    ).toStrictEqual([0.5, 0.5 + 1920 / 256, 0.5 + 1080 / 256, 0.5])
  })
  test('select negative offset gl extent', () => {
    expect(
      selectGLExtent({
        mapSize: [1920, 1080],
        offset: [-1.5, -2.75],
        zoom: 0,
      }),
    ).toStrictEqual([0.5, 0.5 + 1920 / 256, 0.25 + 1080 / 256, 0.25])
  })
  test('select zoomed half-level gl extent', () => {
    expect(
      selectGLExtent({
        mapSize: [1920, 1080],
        offset: [0, 0],
        zoom: 0.75,
      }),
    ).toStrictEqual([
      0,
      1920 / 256 / Math.pow(2, 0.75),
      1080 / 256 / Math.pow(2, 0.75),
      0,
    ])
  })
  test('select zoomed full-level gl extent', () => {
    expect(
      selectGLExtent({ mapSize: [1920, 1080], offset: [0, 0], zoom: 1 }),
    ).toStrictEqual([0, 1920 / 256, 1080 / 256, 0])
  })
  test('select negative zoomed half-level gl extent', () => {
    expect(
      selectGLExtent({
        mapSize: [1920, 1080],
        offset: [0, 0],
        zoom: -0.75,
      }),
    ).toStrictEqual([
      0,
      1920 / 256 / Math.pow(2, 0.25),
      1080 / 256 / Math.pow(2, 0.25),
      0,
    ])
  })
})
