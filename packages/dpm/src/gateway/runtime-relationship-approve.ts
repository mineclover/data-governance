import { copyDiscoverySourceCoordinate } from '../discovery/discovery-source-copy.js'
import type { ApprovedRegistryRelationshipInput, RegistryEvidence } from '../registry/registry-relationship-types.js'
import type {
  DpmGatewayRelationshipApprovalInput,
  DpmGatewayRelationshipApprovalResult,
} from './runtime-relationship-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'

export async function approveDpmRelationshipCandidateRuntime(
  input: DpmGatewayRelationshipApprovalInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayRelationshipApprovalResult>> {
  if (input.candidate.recommendation !== 'review') {
    throw new Error(
      `DPM relationship approval requires a reviewable candidate: `
      + `${input.candidate.id} is ${input.candidate.recommendation}.`,
    )
  }

  const relationship: ApprovedRegistryRelationshipInput = {
    name: input.relationshipName,
    version: input.version,
    status: 'approved',
    type: input.candidate.type,
    parent: {
      table: input.candidate.parent.table,
      columns: [...input.candidate.parent.columns],
    },
    child: {
      table: input.candidate.child.table,
      columns: [...input.candidate.child.columns],
    },
    namespace: input.namespace,
    transformStrategy: input.transformStrategy,
    orphanPolicy: input.orphanPolicy,
    confidenceScore: input.candidate.confidence.score,
    evidence: input.candidate.evidence.map(copyRegistryEvidence),
    approval: {
      owner: input.owner,
      approvedBy: input.approvedBy,
      ...(input.approvedAt ? { approvedAt: input.approvedAt } : {}),
      reason: input.reason,
    },
  }

  return createDpmGatewayRuntimeResponse({
    operationId: 'approveDpmRelationshipCandidate',
    statusCode: 200,
    command: 'approve-relationship-candidate',
    result: {
      relationshipName: input.relationshipName,
      status: 'approved',
      relationship,
    },
  })
}

function copyRegistryEvidence(evidence: RegistryEvidence): RegistryEvidence {
  return {
    kind: evidence.kind,
    message: evidence.message,
    ...(evidence.score !== undefined ? { score: evidence.score } : {}),
    ...(evidence.source ? { source: copyDiscoverySourceCoordinate(evidence.source) } : {}),
    ...(evidence.metadata ? { metadata: { ...evidence.metadata } } : {}),
  }
}
