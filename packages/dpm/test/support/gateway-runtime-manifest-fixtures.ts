import {
  createPostgresCatalogSnapshot,
  parseRegistrySnapshotYaml,
} from '../../src/index.js'
import {
  dpmFixturePath,
  readDpmJsonFixture,
  readDpmTextFixture,
} from './fixture-io.js'

const manifestFixture = 'valid/customer-orders.json'
const catalogFixture = 'catalog/postgres-commerce.json'
const registryFixture = 'registry/commerce-registry.yaml'

export const manifestPath = dpmFixturePath(manifestFixture)
export const catalogPath = dpmFixturePath(catalogFixture)
export const registryPath = dpmFixturePath(registryFixture)
type ManifestRuntimeCliCommand = 'validate' | 'compile' | 'dry-run'

export function parseStdout(stdout: string): Record<string, any> {
  return JSON.parse(stdout) as Record<string, any>
}

export function createRuntimeInput() {
  return {
    manifest: readDpmJsonFixture(manifestFixture),
    catalog: createPostgresCatalogSnapshot(readDpmJsonFixture(catalogFixture)),
    registry: parseRegistrySnapshotYaml(readDpmTextFixture(registryFixture)),
  }
}

export function createManifestRuntimeCliArgs(command: ManifestRuntimeCliCommand): string[] {
  return [
    command,
    '--manifest',
    manifestPath,
    '--catalog',
    catalogPath,
    '--registry',
    registryPath,
  ]
}

export function createBlockingRuntimeInput() {
  const input = createRuntimeInput()
  const manifest = structuredClone(input.manifest) as Record<string, any>
  manifest.columns.push({
    ...structuredClone(manifest.columns[0]),
    role: 'business_metric',
    pii: false,
    transform: { type: 'keep' },
  })
  return {
    ...input,
    manifest,
  }
}
