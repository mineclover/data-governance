import {
  REGISTRY_ORPHAN_POLICIES,
} from '../registry/registry-orphan-policy-taxonomy.js'
import {
  REGISTRY_RELATIONSHIP_KINDS,
} from '../registry/registry-relationship-kind-taxonomy.js'
import {
  REGISTRY_TRANSFORM_STRATEGIES,
} from '../registry/registry-transform-taxonomy.js'
import {
  arrayOf,
  ratioSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayRelationshipApprovalSchemas() {
  return {
    DpmRelationshipApprovalRequest: requiredObjectSchema({
      candidate: ref('DpmRelationshipCandidate'),
      version: stringSchema(),
      namespace: stringSchema(),
      transformStrategy: { type: 'string', enum: [...REGISTRY_TRANSFORM_STRATEGIES] },
      orphanPolicy: { type: 'string', enum: [...REGISTRY_ORPHAN_POLICIES] },
      owner: stringSchema(),
      approvedBy: stringSchema(),
      reason: stringSchema(),
      approvedAt: stringSchema(),
    }, ['candidate', 'version', 'namespace', 'transformStrategy', 'orphanPolicy', 'owner', 'approvedBy', 'reason']),
    DpmRelationshipApprovalResponse: requiredObjectSchema({
      relationshipName: stringSchema(),
      status: { type: 'string', enum: ['approved'] },
      relationship: ref('DpmApprovedRegistryRelationship'),
    }),
    DpmApprovedRegistryRelationship: requiredObjectSchema({
      name: stringSchema(),
      version: stringSchema(),
      status: { type: 'string', enum: ['approved'] },
      type: { type: 'string', enum: [...REGISTRY_RELATIONSHIP_KINDS] },
      parent: ref('DpmRelationshipDiscoveryEndpoint'),
      child: ref('DpmRelationshipDiscoveryEndpoint'),
      namespace: stringSchema(),
      transformStrategy: { type: 'string', enum: [...REGISTRY_TRANSFORM_STRATEGIES] },
      orphanPolicy: { type: 'string', enum: [...REGISTRY_ORPHAN_POLICIES] },
      confidenceScore: ratioSchema(),
      evidence: arrayOf(ref('DpmDiscoveryEvidence')),
      approval: requiredObjectSchema({
        owner: stringSchema(),
        approvedBy: stringSchema(),
        approvedAt: stringSchema(),
        reason: stringSchema(),
      }, ['owner', 'approvedBy', 'reason']),
    }),
  } as const
}
