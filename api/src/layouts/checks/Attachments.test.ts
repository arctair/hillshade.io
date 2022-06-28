import {
  CheckPresent,
  CheckNotPresent,
  errors,
  CheckType,
} from './Attachments'

describe('attachments', () => {
  describe('are expected to not be present', () => {
    test('and they are not present', () => {
      expect(CheckNotPresent({})).toEqual(undefined)
    })
    test('and they are present', () => {
      expect(CheckNotPresent({ attachments: {} })).toEqual(
        errors.ATTACHMENTS_PRESENT,
      )
    })
  })
  describe('are expected to be present', () => {
    test('and they are present', () => {
      expect(CheckPresent({ attachments: { heightmap: 'wasd' } })).toEqual(
        undefined,
      )
    })
    test('and they are present but empty', () => {
      expect(CheckPresent({ attachments: {} })).toEqual(
        errors.ATTACHMENTS_NOT_PRESENT,
      )
    })
    test('and they are not present', () => {
      expect(CheckPresent({})).toEqual(errors.ATTACHMENTS_NOT_PRESENT)
    })
  })
  describe('are expected to be of type Map<string, string>', () => {
    test('and they are of type Map<string, string>', () => {
      expect(CheckType({ attachments: { heightmap: 'asdasda' } })).toEqual(
        undefined,
      )
    })
    test('and they are of type array`', () => {
      expect(CheckType({ attachments: ['im an array'] })).toEqual(
        errors.ATTACHMENTS_BAD_TYPE('array'),
      )
    })
    test('and they are of non-object type', () => {
      expect(CheckType({ attachments: 'im a string' })).toEqual(
        errors.ATTACHMENTS_BAD_TYPE('string'),
      )
    })
    test('and they have a non-string value', () => {
      expect(
        CheckType({ attachments: { 'thats not a string value': false } }),
      ).toEqual(
        errors.ATTACHMENTS_BAD_VALUE_TYPE(
          'thats not a string value',
          'boolean',
        ),
      )
    })
  })
})
