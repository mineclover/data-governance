import type { DpmCanonicalKeyEncodingVersion } from '../model/canonical-key-encoding.js'

export type DpmRegistryCanonicalKeyEncodingContractRequest = {
  datasetId: string
  registryVersion: string
}

export type DpmRegistryCanonicalKeyEncodingClaimInput =
  DpmRegistryCanonicalKeyEncodingContractRequest & {
    canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion
  }

export type DpmRegistryCanonicalKeyEncodingContract =
  DpmRegistryCanonicalKeyEncodingClaimInput & {
    createdAt?: string
    updatedAt?: string
  }
