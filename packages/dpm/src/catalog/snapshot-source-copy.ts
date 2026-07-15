import type { SchemaSourceCoordinate } from '../contract/openapi-projection.js'

import type { CatalogSnapshotSource } from './source-types.js'

export function copySnapshotSource(source: CatalogSnapshotSource): CatalogSnapshotSource {
  if (source.kind === 'postgresql') {
    return {
      kind: 'postgresql',
      database: source.database,
      ...(source.capturedAt ? { capturedAt: source.capturedAt } : {}),
    }
  }

  return {
    kind: 'openapi_projection',
    profile: source.profile,
    projectionVersionHash: source.projectionVersionHash,
    ...(source.projectionRef ? { projectionRef: source.projectionRef } : {}),
  }
}

export function copySourceCoordinate(source: SchemaSourceCoordinate): SchemaSourceCoordinate {
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

export function sortSourceMap(
  sources: Readonly<Record<string, SchemaSourceCoordinate>>,
): Record<string, SchemaSourceCoordinate> {
  const sorted: Record<string, SchemaSourceCoordinate> = {}
  for (const key of Object.keys(sources).sort()) {
    const source = sources[key]
    if (source) sorted[key] = copySourceCoordinate(source)
  }
  return sorted
}
