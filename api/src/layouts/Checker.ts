import { SizeChecker } from './SizeChecker'

export type Checker = {
  check: (layout: any) => string[]
}

export function createChecker(sizeChecker: SizeChecker): Checker {
  return {
    check: (layout) => {
      const errors = []
      const error = sizeChecker.check(layout)
      if (error) errors.push(error)
      return errors
    },
  }
}
