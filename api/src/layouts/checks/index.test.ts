import { create } from '.'

describe('checks', () => {
  const someChecker = jest.fn()
  const anotherChecker = jest.fn()
  const check = create(someChecker, anotherChecker)

  test('no errors', () => {
    someChecker.mockReturnValue(undefined)
    anotherChecker.mockReturnValue(undefined)
    expect(check({ size: [1, 2] })).toEqual([])
  })

  test('some error', () => {
    someChecker.mockReturnValue('some error')
    anotherChecker.mockReturnValue(undefined)
    expect(check({})).toEqual(['some error'])
  })

  test('another error', () => {
    someChecker.mockReturnValue(undefined)
    anotherChecker.mockReturnValue('another error')
    expect(check({})).toEqual(['another error'])
  })

  test('all errors', () => {
    someChecker.mockReturnValue('some error')
    anotherChecker.mockReturnValue('another error')
    expect(check({})).toEqual(['some error', 'another error'])
  })
})
