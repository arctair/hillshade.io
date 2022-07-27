import ViewState from './ViewState'
import { selectLayout } from './selectors'
import { State as ExtentBoxState } from './ExtentBox/types'
import { Extent } from './types'

describe('selectLayout from view state with no extent box', () => {
  test('copy size', () => {
    const view: ViewState = {
      mapSize: [512, 128],
      offset: [0, 0],
      zoom: 0,
    }
    const actual = selectLayout(view).size
    const expected = [512, 128]
    expect(actual).toEqual(expected)
  })
  describe('extent', () => {
    test('map extent is twice wide half tall as world extent', () => {
      const view: ViewState = {
        mapSize: [512, 128],
        offset: [0, 0],
        zoom: 0,
      }
      const actual = selectLayout(view).extent
      const expected = [0, 1 / 2, 2, 0]
      expect(actual).toEqual(expected)
    })
    test('map extent matches world extent', () => {
      const view: ViewState = {
        mapSize: [256, 256],
        offset: [0, 0],
        zoom: 0,
      }
      const actual = selectLayout(view).extent
      const expected = [0, 1, 1, 0]
      expect(actual).toEqual(expected)
    })
    test('map extent offset from world extent', () => {
      const view: ViewState = {
        mapSize: [256, 256],
        offset: [1, 1],
        zoom: 0,
      }
      const actual = selectLayout(view).extent
      const expected = [1, 2, 2, 1]
      expect(actual).toEqual(expected)
    })
    test('map extent is one quarter of world extent', () => {
      const view: ViewState = {
        mapSize: [256, 256],
        offset: [0, 0],
        zoom: 1,
      }
      const actual = selectLayout(view).extent
      const expected = [0, 1 / 2, 1 / 2, 0]
      expect(actual).toEqual(expected)
    })
  })
})

describe('selectLayout from view state with extent box', () => {
  test('subsize', () => {
    const view: ViewState = {
      mapSize: [512, 128],
      offset: [0, 0],
      zoom: 0,
    }
    const extent = [0.125, 0.375, 1.875, 0.125] as Extent
    const actual = selectLayout(view, extent).size
    const expected = [(512 * 7) / 8, (128 * 1) / 2]
    expect(actual).toEqual(expected)
  })
  describe('extent', () => {
    test('copy extent', () => {
      const view: ViewState = {
        mapSize: [512, 128],
        offset: [0, 0],
        zoom: 0,
      }
      const extent = [1, 2, 3, 0] as Extent
      const actual = selectLayout(view, extent).extent
      const expected = extent
      expect(actual).toEqual(expected)
    })
  })
})
