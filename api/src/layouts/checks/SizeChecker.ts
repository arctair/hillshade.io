export const errors = {
  SIZE_MISSING: 'Layout is missing field "size" of type [number, number]',
  SIZE_BAD_TYPE: (badType: string) =>
    `Layout has field "size" of type "${badType}" but it should be of type [number, number]`,
  SIZE_BAD_LENGTH: (badLength: number) =>
    `Layout has field "size" of length ${badLength} but it should be of length 2`,
  SIZE_BAD_ELEMENT_TYPES: (badTypes: string[]) =>
    `Layout has field "size" of type [${badTypes.join(
      ', ',
    )}] but it should be of type [number, number]`,
  SIZE_NON_POSITIVE_DIMENSION: (name: string, value: number) =>
    `Layout has field "size" with non-positive ${name} ${value}`,
}

export function check(layout: any) {
  return !layout.size
    ? errors.SIZE_MISSING
    : !Array.isArray(layout.size)
    ? errors.SIZE_BAD_TYPE(typeof layout.size)
    : layout.size.length !== 2
    ? errors.SIZE_BAD_LENGTH(layout.size.length)
    : !layout.size.every((element: any) => typeof element === 'number')
    ? errors.SIZE_BAD_ELEMENT_TYPES(
        layout.size.map((element: any) => typeof element),
      )
    : layout.size[0] <= 0
    ? errors.SIZE_NON_POSITIVE_DIMENSION('width', layout.size[0])
    : layout.size[1] <= 0
    ? errors.SIZE_NON_POSITIVE_DIMENSION('height', layout.size[1])
    : undefined
}
