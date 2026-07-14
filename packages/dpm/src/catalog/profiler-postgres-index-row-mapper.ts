import type {
  CatalogIndex,
} from './integrity-types.js'
import type {
  PostgresIndexProfileRow,
} from './profiler-postgres-row-filters.js'
import {
  createPostgresDbSource,
  postgresCatalogTableId,
} from './profiler-postgres-row-utils.js'

export function rowToIndex(row: PostgresIndexProfileRow): CatalogIndex {
  const table = postgresCatalogTableId(row)
  return {
    table,
    name: row.index_name,
    columns: [...row.index_columns],
    unique: row.index_unique === true,
    ...(row.index_method ? { method: row.index_method } : {}),
    ...(row.index_predicate ? { predicate: row.index_predicate } : {}),
    source: createPostgresDbSource(
      'index',
      `${table}.${row.index_name}`,
      `#/indexes/${table}.${row.index_name}`,
    ),
  }
}
