import type {
  PostgresCatalogProfileRow,
} from './profiler-postgres-row-types.js'
import {
  createPostgresDbSource,
  postgresCatalogTableId,
  requirePostgresCatalogField,
} from './profiler-postgres-row-utils.js'
import type {
  CatalogColumn,
  CatalogSchema,
  CatalogTable,
} from './structure-types.js'

export function rowToSchema(row: PostgresCatalogProfileRow): CatalogSchema {
  return {
    name: row.schema_name,
    ...(row.schema_owner ? { owner: row.schema_owner } : {}),
    source: createPostgresDbSource('schema', row.schema_name, `#/schemas/${row.schema_name}`),
  }
}

export function rowToTable(row: PostgresCatalogProfileRow): CatalogTable {
  const table = postgresCatalogTableId(row)
  return {
    schema: row.schema_name,
    name: requirePostgresCatalogField(row.table_name, row, 'table_name'),
    table,
    kind: requirePostgresCatalogField(row.table_kind, row, 'table_kind'),
    source: createPostgresDbSource('table', table, `#/tables/${table}`),
  }
}

export function rowToColumn(row: PostgresCatalogProfileRow): CatalogColumn {
  const table = postgresCatalogTableId(row)
  const columnName = requirePostgresCatalogField(row.column_name, row, 'column_name')
  return {
    table,
    name: columnName,
    dataType: requirePostgresCatalogField(row.data_type, row, 'data_type'),
    nullable: requirePostgresCatalogField(row.is_nullable, row, 'is_nullable'),
    ordinal: requirePostgresCatalogField(row.ordinal_position, row, 'ordinal_position'),
    ...(row.default_value !== undefined ? { defaultValue: row.default_value } : {}),
    source: createPostgresDbSource(
      'column',
      `${table}.${columnName}`,
      `#/columns/${table}.${columnName}`,
    ),
  }
}
