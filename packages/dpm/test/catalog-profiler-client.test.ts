import { describe, expect, it, vi } from 'vitest'

import {
  POSTGRES_CATALOG_PROFILE_SQL,
  profilePostgresCatalog,
} from '../src/index.js'
import {
  expectedProfilerPostgresTableNames,
} from './support/catalog-profiler-expected-fixtures.js'
import {
  readProfilerPostgresRowsFixture,
} from './support/catalog-profiler-row-fixtures.js'

describe('DPM PostgreSQL catalog profiler client facade', () => {
  it('profiles through an explicit read-only query client and schema filter', async () => {
    const rows = readProfilerPostgresRowsFixture()
    const query = vi.fn(async () => rows)

    const snapshot = await profilePostgresCatalog({
      database: 'commerce',
      capturedAt: '2026-07-01T00:00:00.000Z',
      schemas: ['public'],
      client: { query },
    })

    expect(query).toHaveBeenCalledWith(POSTGRES_CATALOG_PROFILE_SQL, [['public']])
    expect(snapshot.tables.map(table => table.table)).toEqual([...expectedProfilerPostgresTableNames])
  })
})
