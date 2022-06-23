export function EPSG_3857_TO_EPSG_4326([x, y]: [number, number]): [
  number,
  number,
] {
  const yRadians = (y / 20048966.1) * Math.PI
  return [
    (x / 20026376.39) * 180,
    (Math.atan(2.7182818284 ** yRadians) / Math.PI) * 360 - 90,
  ]
}

export function transformExtent(
  [left0, top0, right0, bottom0]: [number, number, number, number],
  fn: (p: [number, number]) => [number, number],
): [number, number, number, number] {
  const [left1, top1] = fn([left0, top0])
  const [right1, bottom1] = fn([right0, bottom0])
  return [left1, top1, right1, bottom1]
}
