import type { CatalogSnapshot } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmCliFormat } from './types.js'

export type DpmCliInputs = {
  manifest: unknown
  catalog: CatalogSnapshot
  registry: RegistrySnapshot
  format: DpmCliFormat
  estimatedRows?: Record<string, number>
}
