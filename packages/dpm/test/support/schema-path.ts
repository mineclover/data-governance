export type SchemaPath = readonly string[]

export function getSchemaPathValue(schema: unknown, path: SchemaPath): unknown {
  let value = schema

  for (const segment of path) {
    if (!isRecord(value) || !(segment in value)) {
      throw new Error(`expected schema path: ${formatSchemaPath(path)}`)
    }
    value = value[segment]
  }

  return value
}

export function formatSchemaPath(path: SchemaPath): string {
  return path.join('.')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
