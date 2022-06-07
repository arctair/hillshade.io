import { viewStateReducer } from './ViewState'

describe('pan', () => {
  test('when zoom is zero', () => {
    expect(
      viewStateReducer(
        { offset: [0, 0], zoom: 0 },
        { type: 'pan', deltaXY: [1, 2] },
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
        { type: 'pan', deltaXY: [1, 2] },
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
        { type: 'pan', deltaXY: [1, 2] },
      ),
    ).toStrictEqual({
      offset: [0.25, 0.5],
      zoom: 2,
    })
  })
})

test('zoom', () => {
  expect(
    viewStateReducer(
      { offset: [0, 0], zoom: 1 },
      { type: 'zoom', deltaZ: 1 },
    ),
  ).toStrictEqual({ offset: [0, 0], zoom: 2 })
})
