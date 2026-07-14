import {
  createPostgresCatalogSnapshot,
  normalizeCatalogSnapshot,
} from '../../src/index.js'
import { readPostgresCatalogFixture } from './catalog-postgres-input-fixtures.js'

export function createChangedPostgresCatalogSnapshot() {
  const fixture = readPostgresCatalogFixture()
  return createPostgresCatalogSnapshot({
    ...fixture,
    columns: fixture.columns?.map(column =>
      column.table === 'public.orders' && column.name === 'amount'
        ? { ...column, nullable: true }
        : column,
    ),
  })
}

export function createReorderedPostgresCatalogSnapshot() {
  const fixture = readPostgresCatalogFixture()
  return normalizeCatalogSnapshot({
    source: {
      kind: 'postgresql',
      database: fixture.database,
      capturedAt: fixture.capturedAt,
    },
    columns: [...(fixture.columns ?? [])].reverse(),
    tables: [...(fixture.tables ?? [])].reverse(),
    schemas: fixture.schemas,
    primaryKeys: fixture.primaryKeys,
    foreignKeys: fixture.foreignKeys,
    indexes: fixture.indexes,
    uniqueCandidates: fixture.uniqueCandidates,
    sources: fixture.sources,
  })
}
