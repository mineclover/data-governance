import { collectPostgresIntegrityRows } from './profiler-postgres-integrity-collections.js'
import { collectPostgresStructureRows } from './profiler-postgres-structure-collections.js'
import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'
import { createPostgresCatalogSourceMap } from './profiler-postgres-sources.js'
import type { PostgresCatalogSnapshotInput } from './snapshot-input-types.js'

export type PostgresCatalogRowCollections = Pick<
  PostgresCatalogSnapshotInput,
  | 'schemas'
  | 'tables'
  | 'columns'
  | 'primaryKeys'
  | 'foreignKeys'
  | 'indexes'
  | 'uniqueCandidates'
  | 'sources'
>

export function collectPostgresCatalogRows(
  rows: readonly PostgresCatalogProfileRow[],
): PostgresCatalogRowCollections {
  return {
    ...collectPostgresStructureRows(rows),
    ...collectPostgresIntegrityRows(rows),
    sources: createPostgresCatalogSourceMap(rows),
  }
}
