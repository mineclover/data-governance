import type { SchemaSourceCoordinate } from '../contract/openapi-projection.js'

import type {
  RegistryOrphanPolicy,
} from './registry-orphan-policy-taxonomy.js'
import type {
  RegistryRelationshipKind,
} from './registry-relationship-kind-taxonomy.js'
import type {
  RegistryRelationshipStatus,
} from './registry-relationship-status-taxonomy.js'
import type {
  RegistryTransformStrategy,
} from './registry-transform-taxonomy.js'
import type {
  ApprovedRegistryApprovalMetadata,
  RegistryApprovalMetadata,
} from './registry-approval-types.js'
import type { RegistryConditionMetadata } from './registry-condition-types.js'
import type { RegistryEndpoint } from './registry-endpoint-types.js'
import type { RegistryEvidence } from './registry-evidence-types.js'

export type RegistryRelationshipInput = {
  name: string
  version: string
  status: RegistryRelationshipStatus
  type: RegistryRelationshipKind
  parent: RegistryEndpoint
  child: RegistryEndpoint
  namespace: string
  transformStrategy: RegistryTransformStrategy
  orphanPolicy: RegistryOrphanPolicy
  condition?: RegistryConditionMetadata
  confidenceScore?: number
  evidence?: RegistryEvidence[]
  approval: RegistryApprovalMetadata
  supersedes?: string
  supersededBy?: string
  source?: SchemaSourceCoordinate
}

export type ApprovedRegistryRelationshipInput = Omit<RegistryRelationshipInput, 'approval' | 'status'> & {
  status: 'approved'
  approval: ApprovedRegistryApprovalMetadata
}

export type RegistryRelationship = RegistryRelationshipInput & {
  identity: string
  executable: boolean
  evidence: RegistryEvidence[]
  condition: RegistryConditionMetadata
}
