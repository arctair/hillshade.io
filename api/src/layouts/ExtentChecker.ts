export type ExtentChecker = {
  check: (layout: any) => string | undefined
}

export const errors = {
  EXTENT_MISSING:
    'Layout is missing field "extent" of type [ number, number, number, number ]',
  EXTENT_BAD_TYPE: (badType: string) =>
    `Layout has field "extent" of type "${badType}" but it should be of type [ number, number, number, number ]`,
  EXTENT_BAD_LENGTH: (badLength: number) =>
    `Layout has field "extent" of length ${badLength} but it should be of length 4`,
  EXTENT_BAD_ELEMENT_TYPES: (badTypes: string[]) =>
    `Layout has field "extent" of type [${badTypes.join(
      ', ',
    )}] but it should be of type [number, number, number, number]`,
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
        : !Array.isArray(layout.extent)
        ? errors.EXTENT_BAD_TYPE(typeof layout.extent)
        : layout.extent.length !== 4
        ? errors.EXTENT_BAD_LENGTH(layout.extent.length)
        : layout.extent.some((value: any) => typeof value !== 'number')
        ? errors.EXTENT_BAD_ELEMENT_TYPES(
            layout.extent.map((element: any) => typeof element),
          )
        : layout.extent[2] - layout.extent[0] <= 0
        ? errors.EXTENT_NONPOSITIVE_WIDTH(
            layout.extent[0],
            layout.extent[2],
          )
        : layout.extent[3] - layout.extent[1] <= 0
        ? errors.EXTENT_NONPOSITIVE_HEIGHT(
            layout.extent[1],
            layout.extent[3],
          )
        : undefined,
  }
}
