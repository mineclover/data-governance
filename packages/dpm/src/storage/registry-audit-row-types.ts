import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'

import type {
  RegistryApprovalMetadata,
} from '../registry/registry-relationship-types.js'
import type {
  RegistryRelationshipStatus,
} from '../registry/registry-relationship-status-taxonomy.js'

export const DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES = [
  'relationship_approved',
] as const

export type DpmRegistryRelationshipAuditEventType =
  typeof DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES[number]

export type DpmRegistryRelationshipAuditEventRow = {
  eventId: string
  eventType: DpmRegistryRelationshipAuditEventType
  datasetId: string
  registryVersion: string
  relationshipName: string
  relationshipVersion: string
  relationshipStatus: RegistryRelationshipStatus
  actor: string
  reason: string
  occurredAt: string
  sourceFreshnessHash?: string
  approval: RegistryApprovalMetadata
  source?: SchemaSourceCoordinate
  createdAt?: string
}
