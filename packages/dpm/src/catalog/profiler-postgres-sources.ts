import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'

import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'
import {
  createPostgresDbSource,
  postgresCatalogTableId,
} from './profiler-postgres-row-utils.js'

export function createPostgresCatalogSourceMap(
  rows: readonly PostgresCatalogProfileRow[],
): Record<string, SchemaSourceCoordinate> {
  const sources: Record<string, SchemaSourceCoordinate> = {}

  for (const row of rows) {
    if (row.record_kind === 'schema') {
      sources[`schema:${row.schema_name}`] = createPostgresDbSource('schema', row.schema_name, `#/schemas/${row.schema_name}`)
    }
    if (row.table_name) {
      const table = postgresCatalogTableId(row)
      sources[`table:${table}`] = createPostgresDbSource('table', table, `#/tables/${table}`)
    }
    if (row.record_kind === 'column' && row.column_name) {
      const column = `${postgresCatalogTableId(row)}.${row.column_name}`
      sources[`column:${column}`] = createPostgresDbSource('column', column, `#/columns/${column}`)
    }
  }

  return sources
}
