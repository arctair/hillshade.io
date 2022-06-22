import { createSizeChecker, errors } from './SizeChecker'

describe('checker', () => {
  const { check } = createSizeChecker()

  test('no errors', () => {
    expect(check({ size: [1, 2] })).toEqual(undefined)
  })
  test('size missing', () => {
    expect(check({})).toEqual(errors.SIZE_MISSING)
  })
  test('size of bad type string', () => {
    expect(check({ size: 'string' })).toEqual(
      errors.SIZE_BAD_TYPE('string'),
    )
  })
  test('size of bad type object', () => {
    expect(check({ size: {} })).toEqual(errors.SIZE_BAD_TYPE('object'))
  })
  test('size of bad length', () => {
    expect(check({ size: [1, 2, 3] })).toEqual(errors.SIZE_BAD_LENGTH(3))
  })
  test('size element of bad type', () => {
    expect(check({ size: ['asdf', 1234] })).toEqual(
      errors.SIZE_BAD_ELEMENT_TYPES(['string', 'number']),
    )
  })
  test('non-positive width', () => {
    expect(check({ size: [0, 999] })).toEqual(
      errors.SIZE_NON_POSITIVE_DIMENSION('width', 0),
    )
  })
  test('non-positive height', () => {
    expect(check({ size: [999, 0] })).toEqual(
      errors.SIZE_NON_POSITIVE_DIMENSION('height', 0),
    )
  })
})
