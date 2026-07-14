import type {
  CatalogPrimaryKey,
} from './integrity-types.js'
import type {
  PostgresPrimaryKeyProfileRow,
} from './profiler-postgres-row-filters.js'
import {
  createPostgresDbSource,
  postgresCatalogTableId,
} from './profiler-postgres-row-utils.js'

export function rowToPrimaryKey(row: PostgresPrimaryKeyProfileRow): CatalogPrimaryKey {
  const table = postgresCatalogTableId(row)
  return {
    table,
    name: row.constraint_name,
    columns: [...row.constraint_columns],
    source: createPostgresDbSource(
      'constraint',
      `${table}.${row.constraint_name}`,
      `#/primaryKeys/${table}.${row.constraint_name}`,
    ),
  }
}
