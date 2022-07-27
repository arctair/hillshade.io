import { selectGLExtent1D, selectTileExtent1D } from './selectors'

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
