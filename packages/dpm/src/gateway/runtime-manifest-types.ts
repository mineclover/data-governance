import type { CatalogSnapshot, PostgresCatalogSnapshotInput } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'

export type DpmGatewayRuntimeManifestInput = {
  manifest: unknown
  catalog: CatalogSnapshot | PostgresCatalogSnapshotInput
  registry: RegistrySnapshot
  estimatedRows?: Record<string, number>
}
