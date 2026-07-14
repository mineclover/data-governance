import {
  compileDpmPlan,
  createPostgresCatalogSnapshot,
  type DpmCompiledPlan,
  type PostgresCatalogSnapshotInput,
} from '../../src/index.js'
import {
  readDpmJsonFixture,
} from './fixture-io.js'
import { readCommerceRegistrySnapshot } from './registry-yaml-fixtures.js'

export function createPublishingCompiledPlan(): DpmCompiledPlan {
  const catalog = createPostgresCatalogSnapshot(
    readDpmJsonFixture<PostgresCatalogSnapshotInput>('catalog/postgres-commerce.json'),
  )
  const manifest = readDpmJsonFixture<Record<string, any>>('valid/customer-orders.json')
  manifest.catalog.version_hash = catalog.freshness.versionHash
  const compiled = compileDpmPlan({
    manifest,
    catalog,
    registry: readCommerceRegistrySnapshot(),
  })

  if (!compiled.ok) throw new Error('expected compile success')
  return compiled.plan
}
