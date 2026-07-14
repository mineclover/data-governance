import {
  copyDiscoverySourceCoordinate,
} from '../discovery/discovery-source-copy.js'
import {
  assertApprovedRegistryRelationshipApprovalMetadata,
} from './registry-approved-relationship-metadata.js'
import {
  createRegistryRelationshipIdentity,
} from './registry-identity.js'
import {
  byRegistryEvidence,
  copyRegistryApproval,
  copyRegistryEndpoint,
  copyRegistryEvidence,
} from './registry-relationship-copy.js'
import type {
  RegistryRelationship,
  RegistryRelationshipInput,
} from './registry-relationship-types.js'
import type { RegistrySnapshotInput } from './registry-snapshot-types.js'

export function normalizeRegistryRelationship(
  snapshot: Pick<RegistrySnapshotInput, 'datasetId' | 'registryVersion'>,
  relationship: RegistryRelationshipInput,
): RegistryRelationship {
  if (relationship.status === 'approved') {
    assertApprovedRegistryRelationshipApprovalMetadata({
      context: 'snapshot',
      relationshipName: relationship.name,
      approval: relationship.approval,
    })
  }
  const condition = relationship.condition ?? { contextColumns: [] }

  return {
    ...relationship,
    identity: createRegistryRelationshipIdentity(snapshot.datasetId, relationship.name, relationship.version),
    executable: relationship.status === 'approved',
    parent: copyRegistryEndpoint(relationship.parent),
    child: copyRegistryEndpoint(relationship.child),
    condition: {
      contextColumns: [...condition.contextColumns],
      ...(condition.conditionSql ? { conditionSql: condition.conditionSql } : {}),
      ...(condition.temporalCondition ? { temporalCondition: condition.temporalCondition } : {}),
    },
    evidence: [...(relationship.evidence ?? [])].map(copyRegistryEvidence).sort(byRegistryEvidence),
    approval: copyRegistryApproval(relationship.approval),
    ...(relationship.source ? { source: copyDiscoverySourceCoordinate(relationship.source) } : {}),
  }
}
