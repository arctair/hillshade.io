export type Checker = {
  check: (layout: any) => string[]
}

export function create(
  checkers: Array<{ check: (layout: any) => string | undefined }>,
): Checker {
  return {
    check: (layout) =>
      checkers.flatMap(({ check }) => {
        const error = check(layout)
        return error ? [error] : []
      }),
  }
}
