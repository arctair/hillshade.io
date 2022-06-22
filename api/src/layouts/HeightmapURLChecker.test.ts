import {
  create as createHeightmapURLChecker,
  errors,
} from './HeightmapURLChecker'

describe('checker', () => {
  const { check } = createHeightmapURLChecker()

  test('no errors', () => {
    expect(check({})).toEqual(undefined)
  })
  test('heightmap url is present', () => {
    expect(check({ heightmapURL: '' })).toEqual(
      errors.HEIGHTMAP_URL_PRESENT,
    )
  })
})
