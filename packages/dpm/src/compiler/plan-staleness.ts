import type { CatalogSnapshot } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmPlanStaleReason } from './plan-taxonomy.js'
import { asString } from './plan-value-utils.js'

export function getPlanStaleReasons(input: {
  manifestCatalogVersionHash: string
  catalog: CatalogSnapshot
  registryReference: Record<string, unknown>
  registry: RegistrySnapshot
}): DpmPlanStaleReason[] {
  const reasons: DpmPlanStaleReason[] = []
  if (input.manifestCatalogVersionHash && input.manifestCatalogVersionHash !== input.catalog.freshness.versionHash) {
    reasons.push('catalog_version_hash_changed')
  }
  const registryVersion = asString(input.registryReference.registry_version ?? input.registryReference.registryVersion)
  if (registryVersion && registryVersion !== input.registry.registryVersion) {
    reasons.push('registry_version_changed')
  }
  return reasons
}
