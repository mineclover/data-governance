import type {
  CatalogForeignKey,
} from './integrity-types.js'
import type {
  PostgresCatalogProfileRow,
} from './profiler-postgres-row-types.js'
import {
  createPostgresDbSource,
  postgresCatalogTableId,
  requirePostgresCatalogField,
} from './profiler-postgres-row-utils.js'

export function rowToForeignKey(row: PostgresCatalogProfileRow): CatalogForeignKey {
  const table = postgresCatalogTableId(row)
  const name = requirePostgresCatalogField(row.constraint_name, row, 'constraint_name')
  const referencedSchemaName = requirePostgresCatalogField(
    row.referenced_schema_name,
    row,
    'referenced_schema_name',
  )
  const referencedTableName = requirePostgresCatalogField(
    row.referenced_table_name,
    row,
    'referenced_table_name',
  )
  const referencedTable = `${referencedSchemaName}.${referencedTableName}`

  return {
    table,
    name,
    columns: [
      ...requirePostgresCatalogField(row.constraint_columns, row, 'constraint_columns'),
    ],
    referencedTable,
    referencedColumns: [
      ...requirePostgresCatalogField(row.referenced_columns, row, 'referenced_columns'),
    ],
    enforced: true,
    ...(row.on_delete ? { onDelete: row.on_delete } : {}),
    ...(row.on_update ? { onUpdate: row.on_update } : {}),
    source: createPostgresDbSource(
      'constraint',
      `${table}.${name}`,
      `#/foreignKeys/${table}.${name}`,
    ),
  }
}
