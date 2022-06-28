export const errors = {
  HEIGHTMAP_URL_PRESENT:
    'Layout has field "heightmapURL" and it should not be present',
  HEIGHTMAP_URL_NOT_PRESENT:
    'Patch missing field "heightmapURL" and it should be present',
}

export function checkNotPresent(layout: any) {
  return layout.heightmapURL !== undefined
    ? errors.HEIGHTMAP_URL_PRESENT
    : undefined
}

export function checkPresent(patch: any) {
  return patch.heightmapURL === undefined
    ? errors.HEIGHTMAP_URL_NOT_PRESENT
    : undefined
}
