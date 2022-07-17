export const errors = {
  WORLD_SCREEN_HORIZONTAL_RESOLUTION_TOO_BIG:
    "The layout's horizontal resolution is above 200 meters/pixel.",
  WORLD_SCREEN_VERTICAL_RESOLUTION_TOO_BIG:
    "The layout's vertical resolution is above 200 meters/pixel.",
}

export function check(layout: any) {
  return (layout.extent[2] - layout.extent[0]) / layout.size[0] > 200
    ? errors.WORLD_SCREEN_HORIZONTAL_RESOLUTION_TOO_BIG
    : (layout.extent[3] - layout.extent[1]) / layout.size[1] > 200
    ? errors.WORLD_SCREEN_VERTICAL_RESOLUTION_TOO_BIG
    : undefined
}
