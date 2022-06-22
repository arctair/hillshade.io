export type HeightmapURLChecker = {
  check: (layout: any) => string | undefined
}

export const errors = {
  HEIGHTMAP_URL_PRESENT:
    'Layout is has field "heightmapURL" and it should not be present',
}

export function create(): HeightmapURLChecker {
  return {
    check: (layout: any) =>
      layout.heightmapURL !== undefined
        ? errors.HEIGHTMAP_URL_PRESENT
        : undefined,
  }
}
