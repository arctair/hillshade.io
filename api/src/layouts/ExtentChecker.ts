export type ExtentChecker = {
  check: (layout: any) => string | undefined
}

export const errors = {
  EXTENT_MISSING:
    'Layout is missing field "extent" of type { left: number, top: number, right: number, bottom: number }',
  EXTENT_BAD_TYPE: (badType: string) =>
    `Layout has field "extent" of type "${badType}" but it should be of type { left: number, top: number, right: number, bottom: number }`,
  EXTENT_BAD_ELEMENT_TYPES: (elements: Array<[string, string]>) =>
    `Layout has field "extent" of type { ${elements
      .map(([name, type]) => `${name}: ${type}`)
      .join(
        ', ',
      )} } but it should be of type { left: number, top: number, right: number, bottom: number }`,
  EXTENT_NONPOSITIVE_WIDTH: (left: number, right: number) =>
    `Layout has field "extent" with left ${left} and right ${right} resulting in non-positive width`,
  EXTENT_NONPOSITIVE_HEIGHT: (top: number, bottom: number) =>
    `Layout has field "extent" with top ${top} and bottom ${bottom} resulting in non-positive height`,
}

export function create(): ExtentChecker {
  return {
    check: (layout: any) =>
      !layout.extent
        ? errors.EXTENT_MISSING
        : typeof layout.extent !== 'object'
        ? errors.EXTENT_BAD_TYPE(typeof layout.extent)
        : Array.isArray(layout.extent)
        ? errors.EXTENT_BAD_TYPE('array')
        : [
            layout.extent.left,
            layout.extent.top,
            layout.extent.right,
            layout.extent.bottom,
          ].some((value) => typeof value !== 'number')
        ? errors.EXTENT_BAD_ELEMENT_TYPES(
            Object.entries(layout.extent).map(([key, value]) => [
              key,
              typeof value,
            ]),
          )
        : layout.extent.right - layout.extent.left <= 0
        ? errors.EXTENT_NONPOSITIVE_WIDTH(
            layout.extent.left,
            layout.extent.right,
          )
        : layout.extent.bottom - layout.extent.top <= 0
        ? errors.EXTENT_NONPOSITIVE_HEIGHT(
            layout.extent.top,
            layout.extent.bottom,
          )
        : undefined,
  }
}
