import { describe, expect, it, vi } from 'vitest'

import {
  createDpmGatewayRuntime,
  createDpmProfileAnalysisReport,
  createDpmProfileBaselineRow,
  summarizeDpmProfileBaselineRow,
} from '../src/index.js'
import {
  compileGatewayComponentSchema,
} from './support/gateway-schema.js'
import {
  createKafkaProfileArtifact,
  createKafkaProfileArtifactWithCustomerNoPresence,
} from './support/profile-analysis-fixtures.js'
import {
  expectStorageReportPayloadExcludesUnsafeFragments,
} from './support/storage-report-fixtures.js'

describe('DPM gateway profile baseline runtime adapter', () => {
  it('lists body-free profile baseline summaries through the gateway runtime', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const currentProfileArtifact = createKafkaProfileArtifact()
    const analysisReport = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact: currentProfileArtifact,
    })
    const baseline = createDpmProfileBaselineRow({
      profileArtifact,
      analysisReport,
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:gateway-summary-run',
      storedAt: '2026-07-07T00:05:00.000Z',
    })
    const adapterSummary = summarizeDpmProfileBaselineRow(baseline)
    const listProfileBaselineSummaries = vi.fn(async () => [adapterSummary])
    const responseSchema = compileGatewayComponentSchema('DpmProfileBaselineSummaryListResponse')

    const response = await runtime.listDpmProfileBaselineSummaries({
      datasetId: baseline.datasetId,
      profileId: baseline.profileId,
      limit: 1,
      profileBaselineRepository: {
        listProfileBaselineSummaries,
      },
    })
    response.body.result.baselineSummaries[0]!.profileSummary.nodeCount = 999

    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('list-profile-baseline-summaries')
    expect(response.operationId).toBe('listDpmProfileBaselineSummaries')
    expect(listProfileBaselineSummaries).toHaveBeenCalledWith({
      datasetId: baseline.datasetId,
      profileId: baseline.profileId,
      limit: 1,
    })
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result.baselineSummaries).toEqual([
      expect.objectContaining({
        baselineRef: baseline.baselineRef,
        measurementId: baseline.measurementId,
        hasAnalysisReport: true,
      }),
    ])
    expect(adapterSummary.profileSummary.nodeCount).toBe(profileArtifact.nodes.length)
    expect(JSON.stringify(response.body.result)).not.toContain('profileArtifact')
    expect(JSON.stringify(response.body.result)).not.toContain('analysisReport')
    expectStorageReportPayloadExcludesUnsafeFragments(response.body.result)
  })

  it('rejects invalid profile baseline summaries before producing gateway responses', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifact()
    const row = createDpmProfileBaselineRow({ profileArtifact })
    const summary = summarizeDpmProfileBaselineRow(row)

    await expect(runtime.listDpmProfileBaselineSummaries({
      datasetId: row.datasetId,
      profileId: row.profileId,
      profileBaselineRepository: {
        listProfileBaselineSummaries: async () => [{
          ...summary,
          hasAnalysisReport: false,
          analysisSummary: {
            nodeCount: 0,
            edgeCount: 0,
            metricCount: 0,
            diagnosticCount: 0,
            relationshipHintCount: 0,
            keyCandidateCount: 0,
            riskIndicatorCount: 0,
            driftSignalCount: 0,
          },
        }],
      },
    })).rejects.toThrow('profile baseline summary is invalid: analysisSummary')
  })

  it('rejects non-positive profile baseline summary list limits before adapter access', async () => {
    const runtime = createDpmGatewayRuntime()
    const listProfileBaselineSummaries = vi.fn(async () => [])

    await expect(runtime.listDpmProfileBaselineSummaries({
      datasetId: 'commerce_ai',
      profileId: 'profile:kafka:orders-created',
      limit: 0,
      profileBaselineRepository: {
        listProfileBaselineSummaries,
      },
    })).rejects.toThrow('profile baseline summary list limit must be a positive integer')
    expect(listProfileBaselineSummaries).not.toHaveBeenCalled()
  })
})
