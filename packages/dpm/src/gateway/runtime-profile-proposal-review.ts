import type {
  DpmGatewayProfileProposalReviewInput,
  DpmGatewayProfileProposalReviewResult,
} from './runtime-profile-types.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import type { DpmProfileRelationshipHintProposal } from '../profile/analysis-types.js'
import type { DpmProfileDiagnostic } from '../profile/types.js'
import { copyCoordinate } from '../profile/artifact-source-copy.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'

export async function reviewDpmProfileProposalRuntime(
  input: DpmGatewayProfileProposalReviewInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileProposalReviewResult>> {
  const coordinate = input.coordinate ? copyCoordinate(input.coordinate) : undefined
  const relationshipHint = input.relationshipHint
    ? copyProfileRelationshipHintProposal(input.relationshipHint)
    : undefined
  const diagnostics = collectProfileProposalReviewDiagnostics(input, coordinate, relationshipHint)

  return createDpmGatewayRuntimeResponse({
    operationId: 'reviewDpmProfileProposal',
    statusCode: diagnostics.length > 0 ? 400 : 200,
    command: 'review-profile-proposal',
    result: {
      proposalId: input.proposalId,
      status: input.status,
      reviewedBy: input.reviewedBy,
      reason: input.reason,
      ...(input.reviewedAt ? { reviewedAt: input.reviewedAt } : {}),
      ...(coordinate ? { coordinate } : {}),
      ...(relationshipHint ? { relationshipHint } : {}),
      diagnostics,
    },
  })
}

function collectProfileProposalReviewDiagnostics(
  input: DpmGatewayProfileProposalReviewInput,
  coordinate: DpmGatewayProfileProposalReviewResult['coordinate'],
  relationshipHint: DpmGatewayProfileProposalReviewResult['relationshipHint'],
): DpmProfileDiagnostic[] {
  if (!relationshipHint || relationshipHint.id === input.proposalId) return []

  return [{
    severity: 'error',
    code: 'PROF201',
    message: `Profile proposal review target ${input.proposalId} does not match relationship hint ${relationshipHint.id}.`,
    ...(coordinate ? { coordinate } : {}),
    evidenceIds: [...relationshipHint.evidenceIds],
  }]
}

function copyProfileRelationshipHintProposal(
  relationshipHint: DpmProfileRelationshipHintProposal,
): DpmProfileRelationshipHintProposal {
  return {
    id: relationshipHint.id,
    status: relationshipHint.status,
    source: relationshipHint.source,
    fromNodeId: relationshipHint.fromNodeId,
    ...(relationshipHint.hintNodeId ? { hintNodeId: relationshipHint.hintNodeId } : {}),
    ...(relationshipHint.targetRef ? { targetRef: relationshipHint.targetRef } : {}),
    confidence: relationshipHint.confidence,
    evidenceIds: [...relationshipHint.evidenceIds].sort(),
    explanation: relationshipHint.explanation,
  }
}
