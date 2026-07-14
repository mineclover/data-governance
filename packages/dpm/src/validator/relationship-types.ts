import type { CatalogSnapshot } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'

export type ManifestRelationshipEndpoint = {
  table?: string
  columns?: unknown
}

export type ManifestRelationship = {
  name?: string
  status?: string
  type?: string
  parent?: ManifestRelationshipEndpoint
  child?: ManifestRelationshipEndpoint
  namespace?: string
  transform_strategy?: string
  transformStrategy?: string
  orphan_policy?: string
  orphanPolicy?: string
  condition_sql?: string
  temporal_condition?: string
  condition?: {
    conditionSql?: string
    temporalCondition?: string
  }
  canonical_key?: unknown
  canonicalKey?: unknown
}

export type RelationshipRegistryReference = {
  dataset_id?: string
  datasetId?: string
  registry_version?: string
  registryVersion?: string
  canonical_key_encoding_version?: string
  canonicalKeyEncodingVersion?: string
}

export type RelationshipValidationInput = {
  relationships: readonly ManifestRelationship[]
  scopeTables: readonly string[]
  metadataDatasetId?: string
  registryReference?: RelationshipRegistryReference
  catalog: CatalogSnapshot
  registry: RegistrySnapshot
}
