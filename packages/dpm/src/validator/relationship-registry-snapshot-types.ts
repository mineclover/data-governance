import type { RegistryRelationship } from '../registry/registry-relationship-types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { ManifestRelationship } from './relationship-types.js'

export type ApprovedRegistrySnapshotInput = {
  registry: RegistrySnapshot
  relationship: ManifestRelationship
  approved: RegistryRelationship
  pointer: string
}

export type ApprovedRegistrySnapshotContext = ApprovedRegistrySnapshotInput & {
  relationshipName: string
}
