import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const demoRoot = fileURLToPath(new URL('../../examples/customer-orders/', import.meta.url))
export const demoManifestPath = join(demoRoot, 'manifest.json')
export const demoCatalogPath = join(demoRoot, 'catalog.snapshot.json')
export const demoRegistryPath = join(demoRoot, 'relationship-registry.yaml')
export const demoEstimatedRowsPath = join(demoRoot, 'estimated-rows.json')
export const demoPackageRoot = fileURLToPath(new URL('../..', import.meta.url))
export const demoCommandTimeoutMs = 90_000
