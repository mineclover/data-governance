import type {
  OpenApiProjectionResult,
} from '@oa-sdk/openapi-projection-contract'

import { toCatalogDiagnostic } from './projection-diagnostics.js'
import { collectProjectionSchemas } from './projection-schemas.js'
import { collectProjectionTables } from './projection-tables.js'
import { normalizeCatalogSnapshot } from './snapshot.js'

export type CatalogSnapshotFromProjectionOptions = {
  projectionRef?: string
}

export function catalogSnapshotFromOpenApiProjection(
  projection: OpenApiProjectionResult<Record<string, unknown>>,
  options: CatalogSnapshotFromProjectionOptions = {},
) {
  const tables = collectProjectionTables(projection)
  const schemas = collectProjectionSchemas(tables)

  return normalizeCatalogSnapshot({
    source: {
      kind: 'openapi_projection',
      profile: projection.profile,
      projectionVersionHash: projection.versionHash,
      ...(options.projectionRef ? { projectionRef: options.projectionRef } : {}),
    },
    schemas,
    tables,
    sources: projection.sources,
    diagnostics: projection.diagnostics.map(toCatalogDiagnostic),
    projection: {
      profile: projection.profile,
      versionHash: projection.versionHash,
      refs: projection.refs,
      typeTargets: projection.typeTargets ?? [],
    },
    sourceVersionHash: projection.versionHash,
  })
}
