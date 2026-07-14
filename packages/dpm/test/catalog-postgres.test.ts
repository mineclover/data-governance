import { describe, expect, it } from 'vitest'

import {
  createPostgresCatalogSnapshot,
} from '../src/index.js'
import {
  catalogFreshnessVersionHashPattern,
  expectedPostgresCatalogColumnNames,
  expectedPostgresCatalogForeignKey,
  expectedPostgresCatalogSource,
  expectedPostgresCatalogTableNames,
  expectedPostgresCatalogUniqueCandidate,
} from './support/catalog-postgres-expected-fixtures.js'
import { readPostgresCatalogFixture } from './support/catalog-postgres-input-fixtures.js'

describe('DPM PostgreSQL catalog snapshot', () => {
  it('normalizes a PostgreSQL catalog fixture into deterministic internal ordering', () => {
    const fixture = readPostgresCatalogFixture()
    const snapshot = createPostgresCatalogSnapshot(fixture)

    expect(snapshot.kind).toBe('dpm.catalog.snapshot.v1')
    expect(snapshot.source).toEqual(expectedPostgresCatalogSource)
    expect(snapshot.tables.map(table => table.table)).toEqual([...expectedPostgresCatalogTableNames])
    expect(snapshot.columns.map(column => `${column.table}.${column.name}`)).toEqual([
      ...expectedPostgresCatalogColumnNames,
    ])
    expect(snapshot.primaryKeys).toHaveLength(2)
    expect(snapshot.foreignKeys[0]).toMatchObject(expectedPostgresCatalogForeignKey)
    expect(snapshot.indexes.some(index => index.unique)).toBe(true)
    expect(snapshot.uniqueCandidates[0]).toMatchObject(expectedPostgresCatalogUniqueCandidate)
    expect(snapshot.freshness.versionHash).toMatch(catalogFreshnessVersionHashPattern)
  })
})
