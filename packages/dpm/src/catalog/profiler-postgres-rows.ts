import { createPostgresCatalogSnapshot } from './postgres.js'
import type {
  PostgresCatalogRowsToSnapshotInput,
} from './profiler-postgres-row-types.js'
import { collectPostgresCatalogRows } from './profiler-postgres-row-collections.js'
import type {
  CatalogSnapshot,
} from './snapshot-record-types.js'

export type {
  PostgresCatalogProfileRecordKind,
  PostgresCatalogProfileRow,
  PostgresCatalogRowsToSnapshotInput,
} from './profiler-postgres-row-types.js'

export function postgresCatalogRowsToSnapshot(input: PostgresCatalogRowsToSnapshotInput): CatalogSnapshot {
  return createPostgresCatalogSnapshot({
    database: input.database,
    ...(input.capturedAt ? { capturedAt: input.capturedAt } : {}),
    ...collectPostgresCatalogRows(input.rows),
  })
}
