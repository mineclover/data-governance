import { describe, expect, it } from 'vitest'

import {
  invalidProfileAnalysisRequestPayload,
  invalidProfileAnalysisRequestUnsafeShapePayload,
  invalidProfileAnalysisResponsePayload,
  invalidProfileRelationshipHintApprovalRequestPayloadCases,
  invalidProfileProposalReviewRequestPayloadCases,
} from './support/gateway-profile-editor-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway profile editor schemas', () => {
  it('rejects incomplete profile analysis payloads and editor evidence mutation patches', () => {
    const analysisRequestSchema = compileGatewayComponentSchema('DpmProfileAnalysisRequest')
    const analysisResponseSchema = compileGatewayComponentSchema('DpmProfileAnalysisResponse')
    const reviewRequestSchema = compileGatewayComponentSchema('DpmProfileProposalReviewRequest')
    const hintApprovalRequestSchema = compileGatewayComponentSchema('DpmProfileRelationshipHintApprovalRequest')

    expect(
      analysisRequestSchema(invalidProfileAnalysisRequestPayload),
      'DpmProfileAnalysisRequest unexpectedly accepted an incomplete profile artifact',
    ).toBe(false)
    expect(
      analysisRequestSchema(invalidProfileAnalysisRequestUnsafeShapePayload),
      'DpmProfileAnalysisRequest unexpectedly accepted an unsafe profile shape key',
    ).toBe(false)
    expect(
      analysisResponseSchema(invalidProfileAnalysisResponsePayload),
      'DpmProfileAnalysisResponse unexpectedly accepted an incomplete analysis report',
    ).toBe(false)

    for (const [label, payload] of invalidProfileProposalReviewRequestPayloadCases) {
      expect(
        reviewRequestSchema(payload),
        `DpmProfileProposalReviewRequest unexpectedly accepted ${label}`,
      ).toBe(false)
    }
    for (const [label, payload] of invalidProfileRelationshipHintApprovalRequestPayloadCases) {
      expect(
        hintApprovalRequestSchema(payload),
        `DpmProfileRelationshipHintApprovalRequest unexpectedly accepted ${label}`,
      ).toBe(false)
    }
  })
})
