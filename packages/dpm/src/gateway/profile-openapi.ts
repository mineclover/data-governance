import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'
import { createDpmProfileAnalysisGatewaySchemas } from './profile-openapi-analysis-schemas.js'
import { createDpmProfileArtifactGatewaySchemas } from './profile-openapi-artifact-schemas.js'
import { createDpmProfileBaselineGatewaySchemas } from './profile-openapi-baseline-schemas.js'
import { createDpmProfileRelationshipHintApprovalGatewaySchemas } from './profile-openapi-relationship-hint-approval-schemas.js'
import { DPM_PROFILE_PROPOSAL_REVIEW_STATUSES } from './profile-proposal.js'

export function createDpmProfileGatewaySchemas() {
  return {
    ...createDpmProfileArtifactGatewaySchemas(),
    ...createDpmProfileAnalysisGatewaySchemas(),
    ...createDpmProfileBaselineGatewaySchemas(),
    ...createDpmProfileRelationshipHintApprovalGatewaySchemas(),
    DpmProfileProposalReviewRequest: requiredObjectSchema({
      status: { type: 'string', enum: [...DPM_PROFILE_PROPOSAL_REVIEW_STATUSES] },
      reviewedBy: stringSchema(),
      reason: stringSchema(),
      reviewedAt: stringSchema(),
      coordinate: ref('DpmProfileCoordinate'),
      relationshipHint: ref('DpmProfileRelationshipHintProposal'),
    }, ['status', 'reviewedBy', 'reason']),
    DpmProfileProposalReviewResponse: requiredObjectSchema({
      proposalId: stringSchema(),
      status: { type: 'string', enum: [...DPM_PROFILE_PROPOSAL_REVIEW_STATUSES] },
      reviewedBy: stringSchema(),
      reason: stringSchema(),
      reviewedAt: stringSchema(),
      coordinate: ref('DpmProfileCoordinate'),
      relationshipHint: ref('DpmProfileRelationshipHintProposal'),
      diagnostics: arrayOf(ref('DpmProfileDiagnostic')),
    }, ['proposalId', 'status', 'reviewedBy', 'reason', 'diagnostics']),
  } as const
}
