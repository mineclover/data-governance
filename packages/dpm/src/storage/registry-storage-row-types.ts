import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'

import type {
  RegistryApprovalMetadata,
  RegistryEvidence,
  RegistryRelationshipInput,
} from '../registry/registry-relationship-types.js'
import type { DpmCanonicalKeyEncodingVersion } from '../model/canonical-key-encoding.js'
import type {
  RegistryRelationshipKind,
} from '../registry/registry-relationship-kind-taxonomy.js'
import type {
  RegistryRelationshipStatus,
} from '../registry/registry-relationship-status-taxonomy.js'
import type {
  RegistryTransformStrategy,
} from '../registry/registry-transform-taxonomy.js'

export type DpmRegistryRelationshipRow = {
  datasetId: string
  registryVersion: string
  canonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion
  relationshipName: string
  relationshipVersion: string
  status: RegistryRelationshipStatus
  relationshipType: RegistryRelationshipKind
  parentTable: string
  parentColumns: string[]
  childTable: string
  childColumns: string[]
  namespace: string
  transformStrategy: RegistryTransformStrategy
  orphanPolicy: RegistryRelationshipInput['orphanPolicy']
  contextColumns: string[]
  conditionSql?: string
  temporalCondition?: string
  confidenceScore?: number
  evidence: RegistryEvidence[]
  approval: RegistryApprovalMetadata
  supersedes?: string
  supersededBy?: string
  source?: SchemaSourceCoordinate
  sourceFreshnessHash?: string
  createdAt?: string
  updatedAt?: string
}
