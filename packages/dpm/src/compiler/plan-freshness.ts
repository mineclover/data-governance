import type { CatalogSnapshot } from '../catalog/types.js'
import type { DpmDataBindingFreshness } from '../model/data-artifact-types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import {
  normalizeRegistrySnapshotCanonicalKeyEncodingVersion,
} from '../registry/registry-snapshot-encoding.js'
import type { DpmPlanFreshness } from './plan-freshness-types.js'

export function createPlanFreshness(input: {
  manifestCatalogVersionHash?: string
  catalog: CatalogSnapshot
  registry: RegistrySnapshot
  dataBindingFreshness?: DpmDataBindingFreshness
}): DpmPlanFreshness {
  const registry = normalizeRegistrySnapshotCanonicalKeyEncodingVersion(input.registry)
  return {
    ...(input.manifestCatalogVersionHash
      ? { manifestCatalogVersionHash: input.manifestCatalogVersionHash }
      : {}),
    catalogVersionHash: input.catalog.freshness.versionHash,
    registryVersion: registry.registryVersion,
    registryIdentity: registry.identity,
    canonicalKeyEncodingVersion: registry.canonicalKeyEncodingVersion,
    ...(input.dataBindingFreshness ? { dataBindingFreshness: input.dataBindingFreshness } : {}),
  }
}
