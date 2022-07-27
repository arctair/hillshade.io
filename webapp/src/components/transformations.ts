export const MAX_3857_X = 20037508.34
export const MAX_3857_Y = 20037508.34
export function TILE_TO_EPSG_3857([x, y]: [number, number]): [
  number,
  number,
] {
  return [(x * 2 - 1) * MAX_3857_X, (y * 2 - 1) * -MAX_3857_Y]
}

export function EPSG_3857_TO_EPSG_4326([x, y]: [number, number]): [
  number,
  number,
] {
  const yRadians = (y / MAX_3857_Y) * Math.PI
  return [
    (x / MAX_3857_X) * 180,
    (Math.atan(2.7182818284 ** yRadians) / Math.PI) * 360 - 90,
  ]
}

export function transformExtent(
  [left0, bottom0, right0, top0]: [number, number, number, number],
  fn: (p: [number, number]) => [number, number],
): [number, number, number, number] {
  const [left1, bottom1] = fn([left0, bottom0])
  const [right1, top1] = fn([right0, top0])
  return [left1, bottom1, right1, top1]
}
