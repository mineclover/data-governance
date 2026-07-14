import { describe, expect, it } from 'vitest'

import {
  expectedProfilerPostgresForeignKey,
  expectedProfilerPostgresIndexSummaries,
  expectedProfilerPostgresPrimaryKeyNames,
  expectedProfilerPostgresUniqueCandidateSummaries,
} from './support/catalog-profiler-expected-fixtures.js'
import {
  createProfilerPostgresSnapshot,
} from './support/catalog-profiler-row-fixtures.js'

describe('DPM PostgreSQL catalog profiler integrity rows', () => {
  it('maps primary keys, foreign keys, indexes, and unique candidates', () => {
    const snapshot = createProfilerPostgresSnapshot()

    expect(snapshot.primaryKeys.map(primaryKey => `${primaryKey.table}.${primaryKey.name}`)).toEqual([
      ...expectedProfilerPostgresPrimaryKeyNames,
    ])
    expect(snapshot.foreignKeys[0]).toMatchObject(expectedProfilerPostgresForeignKey)
    expect(snapshot.indexes.map(index => `${index.table}.${index.name}:${index.method}:${index.unique}`)).toEqual([
      ...expectedProfilerPostgresIndexSummaries,
    ])
    expect(snapshot.uniqueCandidates.map(candidate => `${candidate.table}.${candidate.name}:${candidate.reason}`)).toEqual([
      ...expectedProfilerPostgresUniqueCandidateSummaries,
    ])
  })
})
