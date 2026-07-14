import {
  isForeignKeyProfileRow,
  isIndexProfileRow,
  isPrimaryKeyProfileRow,
} from './profiler-postgres-row-filters.js'
import {
  rowToForeignKey,
  rowToIndex,
  rowToPrimaryKey,
} from './profiler-postgres-row-mappers.js'
import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'
import {
  indexToUniqueCandidate,
  primaryKeyToUniqueCandidate,
} from './profiler-postgres-unique-candidates.js'
import type { PostgresCatalogSnapshotInput } from './snapshot-input-types.js'

export type PostgresCatalogIntegrityCollections = Pick<
  PostgresCatalogSnapshotInput,
  | 'primaryKeys'
  | 'foreignKeys'
  | 'indexes'
  | 'uniqueCandidates'
>

export function collectPostgresIntegrityRows(
  rows: readonly PostgresCatalogProfileRow[],
): PostgresCatalogIntegrityCollections {
  const primaryKeys = rows.filter(isPrimaryKeyProfileRow).map(rowToPrimaryKey)
  const indexes = rows.filter(isIndexProfileRow).map(rowToIndex)

  return {
    primaryKeys,
    foreignKeys: rows.filter(isForeignKeyProfileRow).map(rowToForeignKey),
    indexes,
    uniqueCandidates: [
      ...primaryKeys.map(primaryKeyToUniqueCandidate),
      ...indexes.filter(index => index.unique).map(indexToUniqueCandidate),
    ],
  }
}
