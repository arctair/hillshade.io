import { check, errors } from './Extent'

describe('checker', () => {
  test('no errors', () => {
    expect(check({ extent: [0, 0, 1, 1] })).toEqual(undefined)
  })
  test('extent missing', () => {
    expect(check({})).toEqual(errors.EXTENT_MISSING)
  })
  test('extent of bad type string', () => {
    expect(check({ extent: 'blah' })).toEqual(
      errors.EXTENT_BAD_TYPE('string'),
    )
  })
  test('extent of bad type object', () => {
    expect(check({ extent: {} })).toEqual(errors.EXTENT_BAD_TYPE('object'))
  })
  test('of bad length', () => {
    expect(check({ extent: [1, 2, 3] })).toEqual(
      errors.EXTENT_BAD_LENGTH(3),
    )
  })
  test('element of bad type', () => {
    expect(check({ extent: ['asdf', 1234, 'qwer', 'ty'] })).toEqual(
      errors.EXTENT_BAD_ELEMENT_TYPES([
        'string',
        'number',
        'string',
        'string',
      ]),
    )
  })
  test('extent has nonpositive width', () => {
    expect(check({ extent: [0, 0, 0, 10] })).toEqual(
      errors.EXTENT_NONPOSITIVE_WIDTH(0, 0),
    )
    expect(check({ extent: [0, 0, -1, 10] })).toEqual(
      errors.EXTENT_NONPOSITIVE_WIDTH(0, -1),
    )
  })
  test('extent has nonpositive height', () => {
    expect(check({ extent: [0, 0, 10, 0] })).toEqual(
      errors.EXTENT_NONPOSITIVE_HEIGHT(0, 0),
    )
    expect(check({ extent: [0, 0, 10, -1] })).toEqual(
      errors.EXTENT_NONPOSITIVE_HEIGHT(0, -1),
    )
  })
})
