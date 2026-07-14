import { describe, expect, it } from 'vitest'

import {
  DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
  computeDpmProfileAnalysisPolicyHash,
  createDpmGatewayRuntime,
  createDpmProfileAnalysisReport,
  resolveDpmGatewayProfileAnalysisRequest,
  resolveDpmProfileAnalysisPolicy,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import {
  createKafkaProfileArtifact,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis policy', () => {
  it('keeps the default policy explicit and compatible with existing measured hints', () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({
      profileArtifact: removeExplicitRelationshipHints(profileArtifact),
    })

    expect(resolveDpmProfileAnalysisPolicy(undefined)).toEqual(DEFAULT_DPM_PROFILE_ANALYSIS_POLICY)
    expect(report.relationshipHints).toContainEqual(expect.objectContaining({
      id: 'proposal:measured:node:field:orders.created.value.customer.customer_no:identifier_like_field',
      confidence: DEFAULT_DPM_PROFILE_ANALYSIS_POLICY.measuredRelationshipConfidenceCap,
    }))
  })

  it('lets consumers tune measured relationship hint thresholds and confidence caps', () => {
    const profileArtifact = removeExplicitRelationshipHints(createKafkaProfileArtifact())

    const strictReport = createDpmProfileAnalysisReport({
      profileArtifact,
      policy: {
        measuredRelationshipPresenceThreshold: 0.998,
      },
    })
    const tunedReport = createDpmProfileAnalysisReport({
      profileArtifact,
      policy: {
        measuredRelationshipPresenceThreshold: 0.9,
        measuredRelationshipConfidenceCap: 0.7,
      },
    })

    expect(strictReport.relationshipHints).not.toContainEqual(expect.objectContaining({
      id: 'proposal:measured:node:field:orders.created.value.customer.customer_no:identifier_like_field',
    }))
    expect(tunedReport.relationshipHints).toContainEqual(expect.objectContaining({
      id: 'proposal:measured:node:field:orders.created.value.customer.customer_no:identifier_like_field',
      confidence: 0.7,
    }))
    expect(strictReport.analysisPolicy).toEqual({
      ...DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
      measuredRelationshipPresenceThreshold: 0.998,
    })
    expect(tunedReport.analysisPolicy).toEqual({
      ...DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
      measuredRelationshipPresenceThreshold: 0.9,
      measuredRelationshipConfidenceCap: 0.7,
    })
    expect(strictReport.freshness.analysisPolicyHash)
      .toBe(computeDpmProfileAnalysisPolicyHash(strictReport.analysisPolicy))
    expect(tunedReport.freshness.analysisPolicyHash)
      .toBe(computeDpmProfileAnalysisPolicyHash(tunedReport.analysisPolicy))
    expect(tunedReport.freshness.analysisPolicyHash).not.toBe(strictReport.freshness.analysisPolicyHash)
    expect(tunedReport.freshness.reportHash).not.toBe(strictReport.freshness.reportHash)
  })

  it('lets consumers tune risk thresholds and identifier fallback confidence', () => {
    const profileArtifact = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({
      profileArtifact: {
        ...profileArtifact,
        metrics: profileArtifact.metrics.filter(metric =>
          metric.subjectId !== 'node:field:orders.created.value.customer.customer_no'
          || metric.kind !== 'presence_ratio'
        ),
      },
      policy: {
        highNullRiskThreshold: 0.99,
        lowPresenceRiskThreshold: 0,
        identifierKeyCandidateFallbackConfidence: 0.42,
      },
    })

    expect(report.riskIndicators).not.toContainEqual(expect.objectContaining({
      kind: 'high_null_ratio',
      metricId: 'metric:orders.created.value.order.promo_code.null',
    }))
    expect(report.riskIndicators).not.toContainEqual(expect.objectContaining({
      kind: 'low_presence_ratio',
    }))
    expect(report.keyCandidates).toContainEqual(expect.objectContaining({
      id: 'key-candidate:node:field:orders.created.value.customer.customer_no:identifier_like_field',
      confidence: 0.42,
    }))
  })

  it('rejects invalid policy ratios before analysis', () => {
    expect(() => createDpmProfileAnalysisReport({
      profileArtifact: createKafkaProfileArtifact(),
      policy: {
        measuredRelationshipPresenceThreshold: 1.1,
      },
    })).toThrow('DPM profile analysis policy measuredRelationshipPresenceThreshold must be a finite ratio between 0 and 1.')
  })

  it('accepts policy through the gateway request schema and runtime request resolver', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifact()
    const request = {
      profileArtifact,
      policy: {
        measuredRelationshipPresenceThreshold: 0.9,
        measuredRelationshipConfidenceCap: 0.7,
      },
    }
    const requestSchema = compileGatewayComponentSchema('DpmProfileAnalysisRequest')

    const resolved = await resolveDpmGatewayProfileAnalysisRequest({ request })
    const response = await runtime.analyzeDpmProfile({
      ...resolved.runtimeInput,
      profileArtifact: removeExplicitRelationshipHints(resolved.runtimeInput.profileArtifact),
    })

    expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
    expect(resolved.runtimeInput.policy).toEqual(request.policy)
    expect(response.body.result.analysisReport.analysisPolicy).toMatchObject(request.policy)
    expect(response.body.result.analysisReport.freshness.analysisPolicyHash)
      .toBe(computeDpmProfileAnalysisPolicyHash(response.body.result.analysisReport.analysisPolicy))
    expect(response.body.result.analysisReport.relationshipHints).toContainEqual(expect.objectContaining({
      id: 'proposal:measured:node:field:orders.created.value.customer.customer_no:identifier_like_field',
      confidence: 0.7,
    }))
  })
})

function removeExplicitRelationshipHints(
  profileArtifact: ReturnType<typeof createKafkaProfileArtifact>,
): ReturnType<typeof createKafkaProfileArtifact> {
  return {
    ...profileArtifact,
    nodes: profileArtifact.nodes.filter(node => node.kind !== 'relationship_hint'),
    edges: profileArtifact.edges.filter(edge => edge.kind !== 'candidate_relationship'),
  }
}
