import type {
  RegistryRelationship,
} from './registry-relationship-types.js'
import type { RegistrySnapshot } from './registry-snapshot-types.js'
import {
  assertApprovedRegistryRelationshipApprovalMetadata,
} from './registry-approved-relationship-metadata.js'

export function selectApprovedRelationships(snapshot: RegistrySnapshot): RegistryRelationship[] {
  return snapshot.relationships.filter(relationship => {
    if (!isExecutableRegistryRelationship(relationship)) return false

    assertApprovedRegistryRelationshipApprovalMetadata({
      context: 'selectApprovedRelationships',
      relationshipName: relationship.name,
      approval: relationship.approval,
    })

    return true
  })
}

export function isExecutableRegistryRelationship(relationship: Pick<RegistryRelationship, 'status'>): boolean {
  return relationship.status === 'approved'
}
