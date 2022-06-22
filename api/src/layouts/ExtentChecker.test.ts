import { create, errors } from './ExtentChecker'

describe('checker', () => {
  const { check } = create()

  test('no errors', () => {
    expect(
      check({ extent: { left: 0, top: 0, right: 1, bottom: 1 } }),
    ).toEqual(undefined)
  })
  test('extent missing', () => {
    expect(check({})).toEqual(errors.EXTENT_MISSING)
  })
  test('extent of bad type string', () => {
    expect(check({ extent: 'blah' })).toEqual(
      errors.EXTENT_BAD_TYPE('string'),
    )
  })
  test('extent of bad type array', () => {
    expect(check({ extent: [] })).toEqual(errors.EXTENT_BAD_TYPE('array'))
  })
  test('extent missing element left', () => {
    expect(check({ extent: {} })).toEqual(
      errors.EXTENT_BAD_ELEMENT_TYPES([]),
    )
  })
  test('extent missing element top', () => {
    expect(check({ extent: { left: 0 } })).toEqual(
      errors.EXTENT_BAD_ELEMENT_TYPES([['left', 'number']]),
    )
  })
  test('extent with element right of bad type', () => {
    expect(
      check({ extent: { left: 0, top: 0, right: 'string' } }),
    ).toEqual(
      errors.EXTENT_BAD_ELEMENT_TYPES([
        ['left', 'number'],
        ['top', 'number'],
        ['right', 'string'],
      ]),
    )
  })
  test('extent missing element bottom', () => {
    expect(check({ extent: { left: 0, top: 0, right: 0 } })).toEqual(
      errors.EXTENT_BAD_ELEMENT_TYPES([
        ['left', 'number'],
        ['top', 'number'],
        ['right', 'number'],
      ]),
    )
  })
  test('extent has nonpositive width', () => {
    expect(
      check({ extent: { left: 0, top: 0, right: 0, bottom: 10 } }),
    ).toEqual(errors.EXTENT_NONPOSITIVE_WIDTH(0, 0))
    expect(
      check({ extent: { left: 0, top: 0, right: -1, bottom: 10 } }),
    ).toEqual(errors.EXTENT_NONPOSITIVE_WIDTH(0, -1))
  })
  test('extent has nonpositive height', () => {
    expect(
      check({ extent: { left: 0, top: 0, right: 10, bottom: 0 } }),
    ).toEqual(errors.EXTENT_NONPOSITIVE_HEIGHT(0, 0))
    expect(
      check({ extent: { left: 0, top: 0, right: 10, bottom: -1 } }),
    ).toEqual(errors.EXTENT_NONPOSITIVE_HEIGHT(0, -1))
  })
})
