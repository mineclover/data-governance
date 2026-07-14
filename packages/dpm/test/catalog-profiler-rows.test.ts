import { describe, expect, it } from 'vitest'

import {
  createProfilerPostgresSnapshot,
  profilerCatalogFreshnessVersionHashPattern,
  PROFILER_POSTGRES_CAPTURED_AT,
} from './support/catalog-profiler-row-fixtures.js'

describe('DPM PostgreSQL catalog profiler rows', () => {
  it('maps PostgreSQL catalog rows to the catalog snapshot envelope', () => {
    const snapshot = createProfilerPostgresSnapshot({
      capturedAt: PROFILER_POSTGRES_CAPTURED_AT,
    })

    expect(snapshot.kind).toBe('dpm.catalog.snapshot.v1')
    expect(snapshot.source).toEqual({
      kind: 'postgresql',
      database: 'commerce',
      capturedAt: PROFILER_POSTGRES_CAPTURED_AT,
    })
    expect(snapshot.freshness.versionHash).toMatch(profilerCatalogFreshnessVersionHashPattern)
  })
})
