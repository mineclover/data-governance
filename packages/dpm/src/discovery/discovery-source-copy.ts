import type { SchemaSourceCoordinate } from '../contract/openapi-projection.js'

export function copyDiscoverySourceCoordinate(source: SchemaSourceCoordinate): SchemaSourceCoordinate {
  if (source.kind === 'file') {
    return {
      kind: 'file',
      filePath: source.filePath,
      pointer: source.pointer,
      ...(source.line !== undefined ? { line: source.line } : {}),
      ...(source.column !== undefined ? { column: source.column } : {}),
    }
  }

  return {
    kind: 'db',
    entity: source.entity,
    id: source.id,
    pointer: source.pointer,
  }
}
