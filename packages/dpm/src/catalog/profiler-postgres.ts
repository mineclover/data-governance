import { POSTGRES_CATALOG_PROFILE_SQL } from './profiler-postgres-query.js'
import {
  postgresCatalogRowsToSnapshot,
} from './profiler-postgres-rows.js'
import type { PostgresCatalogProfileRow } from './profiler-postgres-row-types.js'
import type { CatalogSnapshot } from './snapshot-record-types.js'

export { POSTGRES_CATALOG_PROFILE_SQL } from './profiler-postgres-query.js'
export { postgresCatalogRowsToSnapshot } from './profiler-postgres-rows.js'
export type {
  PostgresCatalogProfileRecordKind,
  PostgresCatalogProfileRow,
  PostgresCatalogRowsToSnapshotInput,
} from './profiler-postgres-row-types.js'

export type PostgresCatalogProfilerClient = {
  query<T>(sql: string, parameters: readonly unknown[]): Promise<readonly T[] | { rows: readonly T[] }>
}

export type PostgresCatalogProfilerInput = {
  database: string
  schemas: readonly string[]
  client: PostgresCatalogProfilerClient
  capturedAt?: string
}

export async function profilePostgresCatalog(input: PostgresCatalogProfilerInput): Promise<CatalogSnapshot> {
  const result = await input.client.query<PostgresCatalogProfileRow>(POSTGRES_CATALOG_PROFILE_SQL, [input.schemas])
  const rows = isRowsEnvelope(result) ? result.rows : result

  return postgresCatalogRowsToSnapshot({
    database: input.database,
    rows,
    ...(input.capturedAt ? { capturedAt: input.capturedAt } : {}),
  })
}

function isRowsEnvelope<T>(result: readonly T[] | { rows: readonly T[] }): result is { rows: readonly T[] } {
  return !Array.isArray(result)
}
