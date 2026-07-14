import { describe, expect, it } from 'vitest'

import {
  postgresCatalogRowsToSnapshot,
} from '../src/index.js'
import {
  readProfilerPostgresRowsFixture,
} from './support/catalog-profiler-row-fixtures.js'

describe('DPM PostgreSQL catalog profiler freshness', () => {
  it('changes freshness when profiled structural rows change', () => {
    const rows = readProfilerPostgresRowsFixture()
    const original = postgresCatalogRowsToSnapshot({ database: 'commerce', rows })
    const changed = postgresCatalogRowsToSnapshot({
      database: 'commerce',
      rows: rows.map(row =>
        row.record_kind === 'column' && row.table_name === 'orders' && row.column_name === 'amount'
          ? { ...row, is_nullable: true }
          : row,
      ),
    })

    expect(changed.freshness.versionHash).not.toBe(original.freshness.versionHash)
  })
})
