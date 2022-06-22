import { createChecker } from './Checker'

describe('checker', () => {
  const sizeChecker = { check: jest.fn() }
  const { check } = createChecker(sizeChecker)

  test('no errors', () => {
    sizeChecker.check.mockReturnValue(undefined)
    expect(check({ size: [1, 2] })).toEqual([])
  })

  test('size error', () => {
    sizeChecker.check.mockReturnValue('size error')
    expect(check({})).toEqual(['size error'])
  })
})
