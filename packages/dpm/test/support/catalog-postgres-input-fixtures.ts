import type {
  PostgresCatalogSnapshotInput,
} from '../../src/index.js'
import { readCatalogFixture } from './catalog-fixture-io.js'

export const POSTGRES_CATALOG_CAPTURED_AT = '2026-07-01T00:00:00.000Z' as const
export const POSTGRES_CATALOG_FIXTURE_NAME = 'postgres-commerce.json' as const

export function readPostgresCatalogFixture(): PostgresCatalogSnapshotInput {
  return readCatalogFixture<PostgresCatalogSnapshotInput>(POSTGRES_CATALOG_FIXTURE_NAME)
}
