import { describe, expect, it } from 'vitest'

import {
  DPM_PROFILE_ANALYSIS_REPORT_KIND,
  DEFAULT_DPM_PROFILE_ANALYSIS_POLICY,
  computeDpmProfileAnalysisPolicyHash,
  createDpmProfileAnalysisReport,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis report', () => {
  it('creates deterministic analysis reports for identical profile artifacts', () => {
    const profile = createKafkaProfileArtifact()
    const first = createDpmProfileAnalysisReport({ profileArtifact: profile })
    const second = createDpmProfileAnalysisReport({ profileArtifact: profile })

    expect(first.kind).toBe(DPM_PROFILE_ANALYSIS_REPORT_KIND)
    expect(first.analysisPolicy).toEqual(DEFAULT_DPM_PROFILE_ANALYSIS_POLICY)
    expect(first.freshness.reportHash).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(first.freshness.analysisPolicyHash)
      .toBe(computeDpmProfileAnalysisPolicyHash(DEFAULT_DPM_PROFILE_ANALYSIS_POLICY))
    expect(second.freshness.reportHash).toBe(first.freshness.reportHash)
    expect(second.summary).toEqual(first.summary)
  })

  it('surfaces profile graph integrity diagnostics during analysis', () => {
    const profile = createKafkaProfileArtifact()
    const report = createDpmProfileAnalysisReport({
      profileArtifact: {
        ...profile,
        sources: [
          ...profile.sources,
          profile.sources[0]!,
        ],
        evidenceSources: {
          ...profile.evidenceSources,
          'evidence:kafka:missing-source': {
            coordinate: {
              kind: 'kafka_topic_bundle',
              sourceId: 'source:kafka:missing',
              path: 'orders.created.missing-source',
            },
          },
        },
        nodes: [
          ...profile.nodes,
          profile.nodes[0]!,
        ],
        edges: [
          ...profile.edges,
          {
            id: 'edge:relationship-hint:missing-source',
            kind: 'candidate_relationship',
            fromNodeId: 'node:field:orders.created.value.customer.missing_field',
            toNodeId: 'node:relationship-hint:hint:orders-created-customer',
            confidence: 0.72,
            evidenceIds: ['evidence:kafka:missing-edge'],
          },
        ],
        metrics: [
          ...profile.metrics,
          {
            id: 'metric:orders.created.missing-field.presence',
            kind: 'presence_ratio',
            subjectId: 'node:field:orders.created.value.customer.missing_field',
            value: 0.8,
            unit: 'ratio',
            evidenceIds: ['evidence:kafka:missing-metric'],
          },
        ],
        diagnostics: [
          {
            severity: 'warning',
            code: 'PROF301',
            message: 'Fixture diagnostic references missing evidence.',
            evidenceIds: ['evidence:kafka:missing-diagnostic'],
          },
        ],
      },
    })

    expect(report.diagnostics.map(diagnostic => diagnostic.code)).toEqual(expect.arrayContaining([
      'PROF301',
      'PROF302',
      'PROF303',
      'PROF304',
      'PROF305',
      'PROF306',
    ]))
    expect(report.diagnostics).toContainEqual(expect.objectContaining({
      code: 'PROF303',
      message: `Profile artifact contains duplicate source id ${profile.sources[0]!.id}.`,
    }))
    expect(report.summary.diagnosticCount).toBe(report.diagnostics.length)
  })

  it('defensively copies profile diagnostics into analysis reports', () => {
    const profile = createKafkaProfileArtifact()
    const profileWithDiagnostic = {
      ...profile,
      diagnostics: [
        {
          severity: 'warning' as const,
          code: 'PROF390' as const,
          message: 'Original profile diagnostic.',
          coordinate: {
            kind: 'kafka_topic_bundle' as const,
            path: 'orders.created.value.customer.customer_no',
          },
          evidenceIds: ['evidence:kafka:orders.created.value.customer.customer_no'],
        },
      ],
    }
    const report = createDpmProfileAnalysisReport({ profileArtifact: profileWithDiagnostic })

    profileWithDiagnostic.diagnostics[0]!.message = 'Mutated after analysis.'
    profileWithDiagnostic.diagnostics[0]!.coordinate!.path = 'mutated.after.analysis'
    profileWithDiagnostic.diagnostics[0]!.evidenceIds!.push('evidence:kafka:mutated')

    expect(report.diagnostics).toContainEqual(expect.objectContaining({
      code: 'PROF390',
      message: 'Original profile diagnostic.',
      coordinate: expect.objectContaining({
        path: 'orders.created.value.customer.customer_no',
      }),
      evidenceIds: ['evidence:kafka:orders.created.value.customer.customer_no'],
    }))
  })
})
