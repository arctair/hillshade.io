import {
  checkPresent,
  checkNotPresent,
  errors,
} from './HeightmapURLChecker'

describe('heightmap url is not present', () => {
  test('no errors', () => {
    expect(checkNotPresent({})).toEqual(undefined)
  })
  test('heightmap url is present', () => {
    expect(checkNotPresent({ heightmapURL: '' })).toEqual(
      errors.HEIGHTMAP_URL_PRESENT,
    )
  })
})
describe('heightmap url is present', () => {
  test('no errors', () => {
    expect(checkPresent({ heightmapURL: '' })).toEqual(undefined)
  })
  test('heightmap url is present', () => {
    expect(checkPresent({})).toEqual(errors.HEIGHTMAP_URL_NOT_PRESENT)
  })
})
