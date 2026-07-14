import type {
  RegistryRelationship,
} from './registry-relationship-types.js'
import {
  REGISTRY_RELATIONSHIP_STATUSES,
  type RegistryRelationshipStatus,
} from './registry-relationship-status-taxonomy.js'

export function createRegistrySnapshotSummary(input: {
  relationships: readonly RegistryRelationship[]
  approvedRelationships: readonly RegistryRelationship[]
  nonExecutableRelationships: readonly RegistryRelationship[]
}) {
  return {
    total: input.relationships.length,
    approved: input.approvedRelationships.length,
    nonExecutable: input.nonExecutableRelationships.length,
    byStatus: countByStatus(input.relationships),
  }
}

function countByStatus(relationships: readonly RegistryRelationship[]): Record<RegistryRelationshipStatus, number> {
  const counts = Object.fromEntries(REGISTRY_RELATIONSHIP_STATUSES.map(status => [status, 0])) as Record<RegistryRelationshipStatus, number>
  for (const relationship of relationships) {
    counts[relationship.status] += 1
  }
  return counts
}
