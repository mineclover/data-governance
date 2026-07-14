import type { DpmCanonicalKeyEncodingVersion } from '../model/canonical-key-encoding.js'
import type { DpmDataBindingFreshness } from '../model/data-artifact-types.js'

export type DpmPlanFreshness = {
  manifestCatalogVersionHash?: string
  catalogVersionHash: string
  registryVersion: string
  registryIdentity: string
  canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion
  dataBindingFreshness?: DpmDataBindingFreshness
}
