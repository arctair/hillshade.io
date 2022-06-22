import { ExtentChecker } from './ExtentChecker'
import { SizeChecker } from './SizeChecker'

export type Checker = {
  check: (layout: any) => string[]
}

export function createChecker(
  extentChecker: ExtentChecker,
  sizeChecker: SizeChecker,
): Checker {
  return {
    check: (layout) => {
      const errors = []
      let error
      error = extentChecker.check(layout)
      if (error) errors.push(error)
      error = sizeChecker.check(layout)
      if (error) errors.push(error)
      return errors
    },
  }
}
