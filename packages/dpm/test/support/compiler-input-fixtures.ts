import {
  createPostgresCatalogSnapshot,
  parseRegistrySnapshotYaml,
  type DpmCompileInput,
  type PostgresCatalogSnapshotInput,
} from '../../src/index.js'
import {
  readDpmJsonFixture,
  readDpmTextFixture,
} from './fixture-io.js'

export function createCompileInput(): DpmCompileInput {
  const catalog = createPostgresCatalogSnapshot(
    readDpmJsonFixture<PostgresCatalogSnapshotInput>('catalog/postgres-commerce.json'),
  )
  const manifest = readDpmJsonFixture<Record<string, any>>('valid/customer-orders.json')

  return {
    manifest,
    catalog,
    registry: parseRegistrySnapshotYaml(readDpmTextFixture('registry/commerce-registry.yaml')),
  }
}
