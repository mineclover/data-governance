import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'

import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'

export function postgresCatalogTableId(row: PostgresCatalogProfileRow): string {
  return `${row.schema_name}.${requirePostgresCatalogField(row.table_name, row, 'table_name')}`
}

export function createPostgresDbSource(entity: string, id: string, pointer: string): SchemaSourceCoordinate {
  return {
    kind: 'db',
    entity,
    id,
    pointer,
  }
}

export function requirePostgresCatalogField<T>(
  value: T | undefined,
  row: PostgresCatalogProfileRow,
  field: string,
): T {
  if (value === undefined) {
    throw new Error(`PostgreSQL catalog ${row.record_kind} row for schema ${row.schema_name} is missing ${field}`)
  }
  return value
}
