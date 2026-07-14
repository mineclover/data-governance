import {
  gatewayOperation,
} from './openapi-operation.js'
import { pathParameter } from './openapi-parameters.js'
import { jsonRequestBody } from './openapi-request-body.js'

export function createDpmProfileGatewayPaths() {
  return {
    '/dpm/profiles/inspect': {
      post: gatewayOperation({
        operationId: 'inspectDpmProfile',
        tags: ['profiles'],
        summary: 'Inspect a normalized profile artifact for editor visualization.',
        requestBody: jsonRequestBody('DpmProfileInspectionRequest'),
        responseSchema: 'DpmProfileInspectionResponse',
      }),
    },
    '/dpm/profiles/analyze': {
      post: gatewayOperation({
        operationId: 'analyzeDpmProfile',
        tags: ['profiles'],
        summary: 'Analyze profile evidence into reviewable hints, risks, drift, and coverage.',
        requestBody: jsonRequestBody('DpmProfileAnalysisRequest'),
        responseSchema: 'DpmProfileAnalysisResponse',
      }),
    },
    '/dpm/profiles/baselines/summaries': {
      post: gatewayOperation({
        operationId: 'listDpmProfileBaselineSummaries',
        tags: ['profiles'],
        summary: 'List body-free profile baseline summaries for history and editor selection.',
        requestBody: jsonRequestBody('DpmProfileBaselineSummaryListRequest'),
        responseSchema: 'DpmProfileBaselineSummaryListResponse',
      }),
    },
    '/dpm/profiles/proposals/{proposalId}/review': {
      post: gatewayOperation({
        operationId: 'reviewDpmProfileProposal',
        tags: ['profiles'],
        summary: 'Record an editor-safe review decision for a profile proposal.',
        parameters: [pathParameter('proposalId')],
        requestBody: jsonRequestBody('DpmProfileProposalReviewRequest'),
        responseSchema: 'DpmProfileProposalReviewResponse',
        blockingResponseSchema: 'DpmProfileProposalReviewResponse',
      }),
    },
    '/dpm/profiles/relationship-hints/{relationshipName}/approve': {
      post: gatewayOperation({
        operationId: 'approveDpmProfileRelationshipHint',
        tags: ['profiles', 'relationships'],
        summary: 'Approve a profile relationship hint into the relationship registry.',
        parameters: [pathParameter('relationshipName')],
        requestBody: jsonRequestBody('DpmProfileRelationshipHintApprovalRequest'),
        responseSchema: 'DpmProfileRelationshipHintApprovalResponse',
        blockingResponseSchema: 'DpmProfileRelationshipHintApprovalBlockingResponse',
      }),
    },
  } as const
}
