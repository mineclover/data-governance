import type { DpmPlanFreshness } from '../compiler/plan.js'

export function copyValidationReportFreshness(freshness: DpmPlanFreshness): DpmPlanFreshness {
  return {
    ...(freshness.manifestCatalogVersionHash ? {
      manifestCatalogVersionHash: freshness.manifestCatalogVersionHash,
    } : {}),
    catalogVersionHash: freshness.catalogVersionHash,
    registryVersion: freshness.registryVersion,
    registryIdentity: freshness.registryIdentity,
    canonicalKeyEncodingVersion: freshness.canonicalKeyEncodingVersion,
  }
}
