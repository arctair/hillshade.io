export const errors = {
  ATTACHMENTS_PRESENT: 'Attachments cannot be attached during creation',
  ATTACHMENTS_NOT_PRESENT:
    'Patch is missing field "attachments" of type Map<string, string>',
  ATTACHMENTS_BAD_TYPE: (badType: string) =>
    `Patch has field "attachments" of type ${badType} but it should be Map<string, string>`,
  ATTACHMENTS_BAD_VALUE_TYPE: (key: string, badType: string) =>
    `Patch has field "attachments.${key}" of type ${badType} but it should be of type string`,
}

export function CheckNotPresent(layout: any): string | undefined {
  return layout.attachments ? errors.ATTACHMENTS_PRESENT : undefined
}

export function CheckPresent(layout: any): string | undefined {
  return layout.attachments && Object.keys(layout.attachments).length > 0
    ? undefined
    : errors.ATTACHMENTS_NOT_PRESENT
}
export function CheckType(patch: any): string | undefined {
  return Array.isArray(patch.attachments)
    ? errors.ATTACHMENTS_BAD_TYPE('array')
    : typeof patch.attachments !== 'object'
    ? errors.ATTACHMENTS_BAD_TYPE(typeof patch.attachments)
    : CheckValueType(patch.attachments)
}

function CheckValueType(attachments: any) {
  for (let [key, value] of Object.entries(attachments)) {
    if (typeof value !== 'string') {
      return errors.ATTACHMENTS_BAD_VALUE_TYPE(key, typeof value)
    }
  }
}
