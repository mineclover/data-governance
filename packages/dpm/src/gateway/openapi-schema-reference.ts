export function ref(schemaName: string) {
  return { $ref: `#/components/schemas/${schemaName}` }
}
