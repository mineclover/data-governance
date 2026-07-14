import type { DpmCanonicalKeyEncodingVersion } from '../model/canonical-key-encoding.js'
import type { RegistryRelationshipStatus } from './registry-relationship-status-taxonomy.js'
import type {
  RegistryRelationship,
  RegistryRelationshipInput,
} from './registry-relationship-types.js'

export type RegistrySnapshotInput = {
  datasetId: string
  registryVersion: string
  canonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
  exportedAt?: string
  relationships: RegistryRelationshipInput[]
}

export type RegistrySnapshot = {
  kind: 'dpm.relationship.registry-snapshot.v1'
  identity: string
  datasetId: string
  registryVersion: string
  canonicalKeyEncodingVersion: DpmCanonicalKeyEncodingVersion
  exportedAt?: string
  relationships: RegistryRelationship[]
  approvedRelationships: RegistryRelationship[]
  nonExecutableRelationships: RegistryRelationship[]
  summary: {
    total: number
    approved: number
    nonExecutable: number
    byStatus: Record<RegistryRelationshipStatus, number>
  }
}
