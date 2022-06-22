import { createChecker } from './Checker'

describe('checker', () => {
  const extentChecker = { check: jest.fn() }
  const sizeChecker = { check: jest.fn() }
  const { check } = createChecker(extentChecker, sizeChecker)

  test('no errors', () => {
    extentChecker.check.mockReturnValue(undefined)
    sizeChecker.check.mockReturnValue(undefined)
    expect(check({ size: [1, 2] })).toEqual([])
  })

  test('extent error', () => {
    extentChecker.check.mockReturnValue('extent error')
    sizeChecker.check.mockReturnValue(undefined)
    expect(check({})).toEqual(['extent error'])
  })

  test('size error', () => {
    extentChecker.check.mockReturnValue(undefined)
    sizeChecker.check.mockReturnValue('size error')
    expect(check({})).toEqual(['size error'])
  })

  test('all errors', () => {
    extentChecker.check.mockReturnValue('extent error')
    sizeChecker.check.mockReturnValue('size error')
    expect(check({})).toEqual(['extent error', 'size error'])
  })
})
