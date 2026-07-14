import type { PostgresCatalogProfileRow } from '../../src/index.js'
import {
  postgresCatalogRowsToSnapshot,
} from '../../src/index.js'
import {
  readDpmJsonFixture,
} from './fixture-io.js'

export const PROFILER_POSTGRES_CAPTURED_AT = '2026-07-01T00:00:00.000Z' as const

export const profilerCatalogFreshnessVersionHashPattern = /^sha256:[a-f0-9]{64}$/

export function readProfilerPostgresRowsFixture(): PostgresCatalogProfileRow[] {
  return readDpmJsonFixture<PostgresCatalogProfileRow[]>('catalog/profiler-postgres-rows.json')
}

export function createProfilerPostgresSnapshot(input: { capturedAt?: string } = {}) {
  return postgresCatalogRowsToSnapshot({
    database: 'commerce',
    capturedAt: input.capturedAt,
    rows: readProfilerPostgresRowsFixture(),
  })
}
