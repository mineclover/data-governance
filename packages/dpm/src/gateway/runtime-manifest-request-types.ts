import type { CatalogSnapshot, PostgresCatalogSnapshotInput } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'

export type DpmGatewaySnapshotRef = {
  ref: string
  versionHash: string
}

export type DpmGatewayManifestRequest = {
  manifest: unknown
  catalogSnapshot: DpmGatewaySnapshotRef
  registrySnapshot: DpmGatewaySnapshotRef
  estimatedRows?: Record<string, number>
}

export type DpmGatewayManifestSnapshotResolver = {
  resolveCatalogSnapshot(
    snapshot: DpmGatewaySnapshotRef,
  ): CatalogSnapshot | PostgresCatalogSnapshotInput | Promise<CatalogSnapshot | PostgresCatalogSnapshotInput>
  resolveRegistrySnapshot(snapshot: DpmGatewaySnapshotRef): RegistrySnapshot | Promise<RegistrySnapshot>
}
