import { create } from './Checker'

describe('checker', () => {
  const someChecker = { check: jest.fn() }
  const anotherChecker = { check: jest.fn() }
  const { check } = create([someChecker, anotherChecker])

  test('no errors', () => {
    someChecker.check.mockReturnValue(undefined)
    anotherChecker.check.mockReturnValue(undefined)
    expect(check({ size: [1, 2] })).toEqual([])
  })

  test('some error', () => {
    someChecker.check.mockReturnValue('some error')
    anotherChecker.check.mockReturnValue(undefined)
    expect(check({})).toEqual(['some error'])
  })

  test('another error', () => {
    someChecker.check.mockReturnValue(undefined)
    anotherChecker.check.mockReturnValue('another error')
    expect(check({})).toEqual(['another error'])
  })

  test('all errors', () => {
    someChecker.check.mockReturnValue('some error')
    anotherChecker.check.mockReturnValue('another error')
    expect(check({})).toEqual(['some error', 'another error'])
  })
})
