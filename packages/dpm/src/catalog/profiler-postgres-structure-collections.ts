import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'
import type { PostgresCatalogSnapshotInput } from './snapshot-input-types.js'
import {
  isColumnProfileRow,
  isSchemaProfileRow,
  isTableProfileRow,
} from './profiler-postgres-row-filters.js'
import {
  rowToColumn,
  rowToSchema,
  rowToTable,
} from './profiler-postgres-row-mappers.js'

export type PostgresCatalogStructureCollections = Pick<
  PostgresCatalogSnapshotInput,
  | 'schemas'
  | 'tables'
  | 'columns'
>

export function collectPostgresStructureRows(
  rows: readonly PostgresCatalogProfileRow[],
): PostgresCatalogStructureCollections {
  return {
    schemas: rows.filter(isSchemaProfileRow).map(rowToSchema),
    tables: rows.filter(isTableProfileRow).map(rowToTable),
    columns: rows.filter(isColumnProfileRow).map(rowToColumn),
  }
}
