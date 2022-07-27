import {
  EPSG_3857_TO_EPSG_4326,
  MAX_3857_X,
  MAX_3857_Y,
} from './transformations'

describe('3857 to 4326', () => {
  test('transform origin', () => {
    const actual = EPSG_3857_TO_EPSG_4326([0, 0])
    const expected = [0, 0]
    expect(actual).toStrictEqual(expected)
  })
  test('transform north east', () => {
    const actual = EPSG_3857_TO_EPSG_4326([MAX_3857_X, MAX_3857_Y])
    const expected = [180, 85.05112877946931]
    expect(actual).toStrictEqual(expected)
  })
  test('transform half north east', () => {
    const actual = EPSG_3857_TO_EPSG_4326([MAX_3857_X / 2, MAX_3857_Y / 2])
    const expected = [90, 66.51326044233275]
    expect(actual).toStrictEqual(expected)
  })
})
