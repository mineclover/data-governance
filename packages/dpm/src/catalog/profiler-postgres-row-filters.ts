import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'

export type PostgresPrimaryKeyProfileRow = PostgresCatalogProfileRow & Required<Pick<
  PostgresCatalogProfileRow,
  'table_name' | 'constraint_name' | 'constraint_columns'
>>

export type PostgresIndexProfileRow = PostgresCatalogProfileRow & Required<Pick<
  PostgresCatalogProfileRow,
  'table_name' | 'index_name' | 'index_columns'
>>

export function isSchemaProfileRow(row: PostgresCatalogProfileRow): boolean {
  return row.record_kind === 'schema'
}

export function isTableProfileRow(row: PostgresCatalogProfileRow): boolean {
  return row.record_kind === 'table'
}

export function isColumnProfileRow(row: PostgresCatalogProfileRow): boolean {
  return row.record_kind === 'column'
}

export function isPrimaryKeyProfileRow(row: PostgresCatalogProfileRow): row is PostgresPrimaryKeyProfileRow {
  return row.record_kind === 'primary_key'
}

export function isForeignKeyProfileRow(row: PostgresCatalogProfileRow): boolean {
  return row.record_kind === 'foreign_key'
}

export function isIndexProfileRow(row: PostgresCatalogProfileRow): row is PostgresIndexProfileRow {
  return row.record_kind === 'index'
}
