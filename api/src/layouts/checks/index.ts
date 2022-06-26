export const create =
  (...checks: Array<Check>): Checks =>
  (v) =>
    checks.flatMap((check) => {
      const error = check(v)
      return error ? [error] : []
    })

export type Checks = (v: any) => string[]
type Check = (v: any) => string | undefined
