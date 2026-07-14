import { createPostgresCatalogSnapshot } from '../catalog/postgres.js'
import type { CatalogSnapshot, PostgresCatalogSnapshotInput } from '../catalog/types.js'

export function resolveDpmGatewayRuntimeCatalogSnapshot(
  catalog: CatalogSnapshot | PostgresCatalogSnapshotInput,
): CatalogSnapshot {
  if (isCatalogSnapshot(catalog)) return catalog
  return createPostgresCatalogSnapshot(catalog)
}

function isCatalogSnapshot(catalog: CatalogSnapshot | PostgresCatalogSnapshotInput): catalog is CatalogSnapshot {
  return 'kind' in catalog && catalog.kind === 'dpm.catalog.snapshot.v1'
}
