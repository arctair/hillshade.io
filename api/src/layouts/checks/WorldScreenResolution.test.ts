import { check, errors } from './WorldScreenResolution'

describe('checker', () => {
  test('no errors', () => {
    expect(
      check({ extent: [0, 0, 256 * 200, 256 * 200], size: [256, 256] }),
    ).toEqual(undefined)
  })
  test('horizontal world resolution too big', () => {
    expect(
      check({ extent: [0, 0, 256 * 201, 512 * 200], size: [256, 512] }),
    ).toEqual(errors.WORLD_SCREEN_HORIZONTAL_RESOLUTION_TOO_BIG)
  })
  test('vertical world resolution too big', () => {
    expect(
      check({ extent: [0, 0, 512 * 200, 256 * 201], size: [512, 256] }),
    ).toEqual(errors.WORLD_SCREEN_VERTICAL_RESOLUTION_TOO_BIG)
  })
})
