import { describe, expect, it, vi } from 'vitest'

import {
  assertDpmProfileBaselineSummary,
  DPM_PROFILE_BASELINE_KIND,
  createDpmProfileAnalysisReport,
  createDpmProfileBaselineRepository,
  createDpmProfileBaselineRow,
  createDpmProfileBaselineMeasurementId,
  selectDpmPreviousProfileBaseline,
  selectDpmPreviousProfileBaselineSummary,
  summarizeDpmProfileBaselineRow,
  summarizeDpmProfileBaselineRows,
  type DpmProfileBaselineListRequest,
  type DpmProfileBaselineRequest,
  type DpmProfileBaselineRow,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
  createKafkaProfileArtifactWithCustomerNoPresence,
} from './support/profile-analysis-fixtures.js'
import {
  expectStorageReportPayloadExcludesUnsafeFragments,
} from './support/storage-report-fixtures.js'

describe('DPM profile baseline repository', () => {
  it('stores profile artifacts and analysis reports as defensive baseline rows', async () => {
    const storedRows = new Map<string, DpmProfileBaselineRow>()
    const upsertProfileBaseline = vi.fn(async (row: DpmProfileBaselineRow) => {
      storedRows.set(row.baselineRef, row)
    })
    const getProfileBaseline = vi.fn((request: DpmProfileBaselineRequest) =>
      storedRows.get(request.baselineRef)
    )
    const listProfileBaselines = vi.fn((request: DpmProfileBaselineListRequest) =>
      [...storedRows.values()].filter(row =>
        row.datasetId === request.datasetId
        && row.profileId === request.profileId
      ).slice(0, request.limit)
    )
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline,
      getProfileBaseline,
      listProfileBaselines,
    })
    const profileArtifact = createKafkaProfileArtifact()
    const previousProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const analysisReport = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact,
    })

    const row = await repository.saveProfileBaseline({
      profileArtifact,
      analysisReport,
      storedAt: '2026-07-07T00:00:00.000Z',
    })
    const adapterRow = storedRows.get(row.baselineRef)!

    profileArtifact.nodes[0]!.label = 'mutated after profile baseline save'
    analysisReport.driftSignals[0]!.explanation = 'Mutated after profile baseline save.'
    analysisReport.analysisPolicy.measuredRelationshipConfidenceCap = 0
    row.profileArtifact.nodes[0]!.label = 'mutated returned row after profile baseline save'
    row.analysisReport!.driftSignals[0]!.explanation = 'Mutated returned row after profile baseline save.'
    row.analysisReport!.analysisPolicy.measuredRelationshipPresenceThreshold = 0

    expect(upsertProfileBaseline).toHaveBeenCalledWith(adapterRow)
    expect(adapterRow).not.toBe(row)
    expect(row).toMatchObject({
      kind: DPM_PROFILE_BASELINE_KIND,
      datasetId: profileArtifact.datasetId,
      profileId: profileArtifact.profileId,
      profileVersion: profileArtifact.profileVersion,
      profileVersionHash: profileArtifact.freshness.versionHash,
      reportHash: analysisReport.freshness.reportHash,
      previousProfileVersionHash: previousProfileArtifact.freshness.versionHash,
      storedAt: '2026-07-07T00:00:00.000Z',
    })
    expect(row.baselineRef).toBe(
      `dpm-profile-baseline:${profileArtifact.datasetId}:${profileArtifact.profileId}:${profileArtifact.freshness.versionHash}`,
    )
    expect(row.profileArtifact.nodes[0]?.label).not.toBe('mutated after profile baseline save')
    expect(row.analysisReport?.driftSignals[0]?.explanation).not.toBe('Mutated after profile baseline save.')
    expect(row.analysisReport?.analysisPolicy.measuredRelationshipConfidenceCap).not.toBe(0)
    expect(adapterRow.profileArtifact.nodes[0]?.label)
      .not.toBe('mutated returned row after profile baseline save')
    expect(adapterRow.analysisReport?.driftSignals[0]?.explanation)
      .not.toBe('Mutated returned row after profile baseline save.')
    expect(adapterRow.analysisReport?.analysisPolicy.measuredRelationshipPresenceThreshold).not.toBe(0)
    expectStorageReportPayloadExcludesUnsafeFragments(row)

    const retrieved = await repository.getProfileBaseline({ baselineRef: row.baselineRef })
    retrieved!.profileArtifact.nodes[0]!.label = 'mutated after baseline get'
    retrieved!.analysisReport!.driftSignals[0]!.explanation = 'Mutated after baseline get.'
    retrieved!.analysisReport!.analysisPolicy.highNullRiskThreshold = 0

    expect(getProfileBaseline).toHaveBeenCalledWith({ baselineRef: row.baselineRef })
    expect(storedRows.get(row.baselineRef)?.profileArtifact.nodes[0]?.label).not.toBe('mutated after baseline get')
    expect(storedRows.get(row.baselineRef)?.analysisReport?.driftSignals[0]?.explanation)
      .not.toBe('Mutated after baseline get.')
    expect(storedRows.get(row.baselineRef)?.analysisReport?.analysisPolicy.highNullRiskThreshold).not.toBe(0)

    const listed = await repository.listProfileBaselines({
      datasetId: profileArtifact.datasetId,
      profileId: profileArtifact.profileId,
      limit: 1,
    })

    expect(listProfileBaselines).toHaveBeenCalledWith({
      datasetId: profileArtifact.datasetId,
      profileId: profileArtifact.profileId,
      limit: 1,
    })
    expect(listed).toHaveLength(1)
    expect(listed[0]).toEqual(adapterRow)
    expect(listed[0]).not.toBe(adapterRow)
  })

  it('keeps same-version measurement baselines addressable as distinct history rows', async () => {
    const storedRows = new Map<string, DpmProfileBaselineRow>()
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: row => storedRows.set(row.baselineRef, row),
      getProfileBaseline: request => storedRows.get(request.baselineRef),
      listProfileBaselines: request =>
        [...storedRows.values()].filter(row =>
          row.datasetId === request.datasetId
          && row.profileId === request.profileId
        ),
    })
    const profileArtifact = createKafkaProfileArtifact()
    const analysisReport = createDpmProfileAnalysisReport({ profileArtifact })

    const firstMeasurement = await repository.saveProfileBaseline({
      profileArtifact,
      analysisReport,
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:previous-run-a',
      storedAt: '2026-07-07T00:05:00.000Z',
    })
    const secondMeasurement = await repository.saveProfileBaseline({
      profileArtifact,
      analysisReport,
      measuredAt: '2026-07-07T01:00:00.000Z',
      measurementRunHash: 'sha256:previous-run-b',
      storedAt: '2026-07-07T01:05:00.000Z',
    })

    expect(firstMeasurement.measurementId).toBe(createDpmProfileBaselineMeasurementId({
      profileArtifact,
      analysisReport,
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:previous-run-a',
    }))
    expect(firstMeasurement.measurementId).toEqual(expect.stringMatching(/^sha256:/))
    expect(secondMeasurement.measurementId).toEqual(expect.stringMatching(/^sha256:/))
    expect(firstMeasurement.measurementId).not.toBe(secondMeasurement.measurementId)
    expect(firstMeasurement.baselineRef).toBe(
      `dpm-profile-baseline:${profileArtifact.datasetId}:${profileArtifact.profileId}:`
      + `${profileArtifact.freshness.versionHash}:${firstMeasurement.measurementId}`,
    )
    expect(secondMeasurement.baselineRef).not.toBe(firstMeasurement.baselineRef)
    expect(storedRows.size).toBe(2)

    const retrieved = await repository.getProfileBaseline({ baselineRef: firstMeasurement.baselineRef })
    const listed = await repository.listProfileBaselines({
      datasetId: profileArtifact.datasetId,
      profileId: profileArtifact.profileId,
    })

    expect(retrieved?.measurementId).toBe(firstMeasurement.measurementId)
    expect(retrieved?.measuredAt).toBe('2026-07-07T00:00:00.000Z')
    expect(retrieved?.measurementRunHash).toBe('sha256:previous-run-a')
    expect(listed.map(row => row.baselineRef)).toEqual([
      firstMeasurement.baselineRef,
      secondMeasurement.baselineRef,
    ])
  })

  it('projects profile baseline history rows into body-free summaries', async () => {
    const profileArtifact = createKafkaProfileArtifact()
    const previousProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const analysisReport = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact,
    })
    const row = createDpmProfileBaselineRow({
      profileArtifact,
      analysisReport,
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:summary-run',
      storedAt: '2026-07-07T00:05:00.000Z',
    })
    const listProfileBaselines = vi.fn((request: DpmProfileBaselineListRequest) =>
      [row].filter(candidate =>
        candidate.datasetId === request.datasetId
        && candidate.profileId === request.profileId
      )
    )
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: async () => undefined,
      getProfileBaseline: async () => row,
      listProfileBaselines,
    })

    const summary = summarizeDpmProfileBaselineRow(row)
    const summaries = summarizeDpmProfileBaselineRows([row])
    const repositorySummaries = await repository.listProfileBaselineSummaries({
      datasetId: row.datasetId,
      profileId: row.profileId,
      limit: 1,
    })
    summary.analysisSummary!.relationshipHintCount = 999

    expect(listProfileBaselines).toHaveBeenCalledWith({
      datasetId: row.datasetId,
      profileId: row.profileId,
      limit: 1,
    })
    expect(summary).toMatchObject({
      kind: DPM_PROFILE_BASELINE_KIND,
      baselineRef: row.baselineRef,
      datasetId: row.datasetId,
      profileId: row.profileId,
      profileVersion: row.profileVersion,
      profileVersionHash: row.profileVersionHash,
      measurementId: row.measurementId,
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:summary-run',
      reportHash: analysisReport.freshness.reportHash,
      previousProfileVersionHash: previousProfileArtifact.freshness.versionHash,
      storedAt: '2026-07-07T00:05:00.000Z',
      hasAnalysisReport: true,
      profileSummary: {
        nodeCount: profileArtifact.nodes.length,
        edgeCount: profileArtifact.edges.length,
        metricCount: profileArtifact.metrics.length,
        diagnosticCount: profileArtifact.diagnostics.length,
      },
    })
    expect(summary.analysisSummary?.driftSignalCount).toBe(analysisReport.summary.driftSignalCount)
    expect(analysisReport.summary.relationshipHintCount).not.toBe(999)
    expect(summaries).toHaveLength(1)
    expect(repositorySummaries).toEqual(summaries)
    expect(JSON.stringify(summary)).not.toContain('profileArtifact')
    expect(JSON.stringify(summary)).not.toContain('analysisReport')
    expect(JSON.stringify(repositorySummaries)).not.toContain('profileArtifact')
    expect(JSON.stringify(repositorySummaries)).not.toContain('analysisReport')
    expectStorageReportPayloadExcludesUnsafeFragments(summary)
  })

  it('uses storage-provided profile baseline summaries without loading row bodies', async () => {
    const profileArtifact = createKafkaProfileArtifact()
    const previousProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const analysisReport = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact,
    })
    const row = createDpmProfileBaselineRow({
      profileArtifact,
      analysisReport,
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:summary-only-run',
      storedAt: '2026-07-07T00:05:00.000Z',
    })
    const adapterSummary = summarizeDpmProfileBaselineRow(row)
    const listProfileBaselines = vi.fn(() => {
      throw new Error('profile baseline row bodies should not be loaded for summary-only adapters')
    })
    const listProfileBaselineSummaries = vi.fn((request: DpmProfileBaselineListRequest) =>
      [adapterSummary].filter(summary =>
        summary.datasetId === request.datasetId
        && summary.profileId === request.profileId
      )
    )
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: async () => undefined,
      getProfileBaseline: async () => row,
      listProfileBaselines,
      listProfileBaselineSummaries,
    })

    const repositorySummaries = await repository.listProfileBaselineSummaries({
      datasetId: row.datasetId,
      profileId: row.profileId,
      limit: 1,
    })
    repositorySummaries[0]!.profileSummary.nodeCount = 999
    repositorySummaries[0]!.analysisSummary!.relationshipHintCount = 999

    expect(listProfileBaselineSummaries).toHaveBeenCalledWith({
      datasetId: row.datasetId,
      profileId: row.profileId,
      limit: 1,
    })
    expect(listProfileBaselines).not.toHaveBeenCalled()
    expect(repositorySummaries).toEqual([
      expect.objectContaining({
        baselineRef: row.baselineRef,
        measurementId: row.measurementId,
        hasAnalysisReport: true,
      }),
    ])
    expect(adapterSummary.profileSummary.nodeCount).toBe(profileArtifact.nodes.length)
    expect(adapterSummary.analysisSummary?.relationshipHintCount).toBe(analysisReport.summary.relationshipHintCount)
    expect(JSON.stringify(repositorySummaries)).not.toContain('profileArtifact')
    expect(JSON.stringify(repositorySummaries)).not.toContain('analysisReport')
  })

  it('rejects invalid storage-provided profile baseline summaries at the repository boundary', async () => {
    const profileArtifact = createKafkaProfileArtifact()
    const row = createDpmProfileBaselineRow({
      profileArtifact,
      analysisReport: createDpmProfileAnalysisReport({ profileArtifact }),
      storedAt: '2026-07-07T00:05:00.000Z',
    })
    const validSummary = summarizeDpmProfileBaselineRow(row)
    const inconsistentSummary = {
      ...validSummary,
      hasAnalysisReport: false,
    }
    const negativeCountSummary = {
      ...validSummary,
      profileSummary: {
        ...validSummary.profileSummary,
        nodeCount: -1,
      },
    }
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: async () => undefined,
      getProfileBaseline: async () => row,
      listProfileBaselines: async () => [row],
      listProfileBaselineSummaries: async () => [inconsistentSummary],
    })

    expect(() => assertDpmProfileBaselineSummary(inconsistentSummary))
      .toThrow('profile baseline summary is invalid: analysisSummary')
    expect(() => assertDpmProfileBaselineSummary(negativeCountSummary))
      .toThrow('profile baseline summary is invalid: profileSummary.nodeCount')
    await expect(repository.listProfileBaselineSummaries({
      datasetId: row.datasetId,
      profileId: row.profileId,
    })).rejects.toThrow('profile baseline summary is invalid: analysisSummary')
    await expect(repository.selectPreviousProfileBaseline({
      profileArtifact,
    })).rejects.toThrow('profile baseline summary is invalid: analysisSummary')
  })

  it('selects the latest previous baseline through summaries before loading the selected row body', async () => {
    const storedRows = new Map<string, DpmProfileBaselineRow>()
    const profileArtifact = createKafkaProfileArtifact()
    const olderProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.88)
    const latestPreviousProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const currentBaseline = createDpmProfileBaselineRow({
      profileArtifact,
      storedAt: '2026-07-08T00:00:00.000Z',
    })
    const olderBaseline = createDpmProfileBaselineRow({
      profileArtifact: olderProfileArtifact,
      storedAt: '2026-07-06T00:00:00.000Z',
    })
    const latestPreviousBaseline = createDpmProfileBaselineRow({
      profileArtifact: latestPreviousProfileArtifact,
      storedAt: '2026-07-07T00:00:00.000Z',
    })
    for (const row of [currentBaseline, olderBaseline, latestPreviousBaseline]) {
      storedRows.set(row.baselineRef, row)
    }
    const summaries = [
      summarizeDpmProfileBaselineRow(currentBaseline),
      summarizeDpmProfileBaselineRow(olderBaseline),
      summarizeDpmProfileBaselineRow(latestPreviousBaseline),
    ]
    const getProfileBaseline = vi.fn((request: DpmProfileBaselineRequest) =>
      storedRows.get(request.baselineRef)
    )
    const listProfileBaselines = vi.fn(() => {
      throw new Error('profile baseline row bodies should not be listed for summary-first selection')
    })
    const listProfileBaselineSummaries = vi.fn((request: DpmProfileBaselineListRequest) =>
      summaries.filter(summary =>
        summary.datasetId === request.datasetId
        && summary.profileId === request.profileId
      )
    )
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: async () => undefined,
      getProfileBaseline,
      listProfileBaselines,
      listProfileBaselineSummaries,
    })

    const selected = await repository.selectPreviousProfileBaseline({
      profileArtifact,
      limit: 1,
    })
    selected!.profileArtifact.nodes[0]!.label = 'mutated summary-first selected previous baseline'

    expect(listProfileBaselineSummaries).toHaveBeenCalledWith({
      datasetId: profileArtifact.datasetId,
      profileId: profileArtifact.profileId,
    })
    expect(listProfileBaselines).not.toHaveBeenCalled()
    expect(getProfileBaseline).toHaveBeenCalledWith({
      baselineRef: latestPreviousBaseline.baselineRef,
    })
    expect(selected?.baselineRef).toBe(latestPreviousBaseline.baselineRef)
    expect(selected?.baselineRef).not.toBe(currentBaseline.baselineRef)
    expect(selected?.baselineRef).not.toBe(olderBaseline.baselineRef)
    expect(storedRows.get(latestPreviousBaseline.baselineRef)?.profileArtifact.nodes[0]?.label)
      .not.toBe('mutated summary-first selected previous baseline')
  })

  it('preserves adapter row metadata when analysis report bodies are omitted', async () => {
    const profileArtifact = createKafkaProfileArtifact()
    const previousProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const analysisReport = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact,
    })
    const row = createDpmProfileBaselineRow({
      profileArtifact,
      analysisReport,
      storedAt: '2026-07-07T00:00:00.000Z',
    })
    const metadataOnlyRow: DpmProfileBaselineRow = {
      kind: row.kind,
      baselineRef: row.baselineRef,
      datasetId: row.datasetId,
      profileId: row.profileId,
      profileVersion: row.profileVersion,
      profileVersionHash: row.profileVersionHash,
      ...(row.reportHash !== undefined ? { reportHash: row.reportHash } : {}),
      ...(row.previousProfileVersionHash !== undefined
        ? { previousProfileVersionHash: row.previousProfileVersionHash }
        : {}),
      profileArtifact: row.profileArtifact,
      ...(row.storedAt !== undefined ? { storedAt: row.storedAt } : {}),
    }
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: async () => undefined,
      getProfileBaseline: async () => metadataOnlyRow,
      listProfileBaselines: async () => [metadataOnlyRow],
    })

    const retrieved = await repository.getProfileBaseline({ baselineRef: row.baselineRef })
    const listed = await repository.listProfileBaselines({
      datasetId: row.datasetId,
      profileId: row.profileId,
      limit: 1,
    })

    expect(retrieved).toEqual(metadataOnlyRow)
    expect(retrieved).not.toBe(metadataOnlyRow)
    expect(retrieved?.analysisReport).toBeUndefined()
    expect(retrieved?.reportHash).toBe(row.reportHash)
    expect(retrieved?.previousProfileVersionHash).toBe(row.previousProfileVersionHash)
    expect(listed).toEqual([metadataOnlyRow])
    expect(listed[0]).not.toBe(metadataOnlyRow)
  })

  it('selects the latest previous baseline from the same profile history', async () => {
    const storedRows = new Map<string, DpmProfileBaselineRow>()
    const listProfileBaselines = vi.fn((request: DpmProfileBaselineListRequest) =>
      [...storedRows.values()].filter(row =>
        row.datasetId === request.datasetId
        && row.profileId === request.profileId
      ).slice(0, request.limit)
    )
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: row => storedRows.set(row.baselineRef, row),
      getProfileBaseline: request => storedRows.get(request.baselineRef),
      listProfileBaselines,
    })
    const currentProfileArtifact = createKafkaProfileArtifact()
    const olderProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.88)
    const latestPreviousProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const currentBaseline = await repository.saveProfileBaseline({
      profileArtifact: currentProfileArtifact,
      storedAt: '2026-07-08T00:00:00.000Z',
    })
    const olderBaseline = await repository.saveProfileBaseline({
      profileArtifact: olderProfileArtifact,
      storedAt: '2026-07-06T00:00:00.000Z',
    })
    const latestPreviousBaseline = await repository.saveProfileBaseline({
      profileArtifact: latestPreviousProfileArtifact,
      storedAt: '2026-07-07T00:00:00.000Z',
    })

    const selected = await repository.selectPreviousProfileBaseline({
      profileArtifact: currentProfileArtifact,
      limit: 1,
    })
    selected!.profileArtifact.nodes[0]!.label = 'mutated selected previous baseline'

    expect(listProfileBaselines).toHaveBeenLastCalledWith({
      datasetId: currentProfileArtifact.datasetId,
      profileId: currentProfileArtifact.profileId,
    })
    expect(selected?.baselineRef).toBe(latestPreviousBaseline.baselineRef)
    expect(selected?.baselineRef).not.toBe(currentBaseline.baselineRef)
    expect(selected?.baselineRef).not.toBe(olderBaseline.baselineRef)
    expect(storedRows.get(latestPreviousBaseline.baselineRef)?.profileArtifact.nodes[0]?.label)
      .not.toBe('mutated selected previous baseline')

    const directlySelected = selectDpmPreviousProfileBaseline({
      profileArtifact: currentProfileArtifact,
      baselines: [...storedRows.values()],
      limit: 1,
    })
    const directlySelectedSummary = selectDpmPreviousProfileBaselineSummary({
      profileArtifact: currentProfileArtifact,
      baselineSummaries: [...storedRows.values()].map(summarizeDpmProfileBaselineRow),
      limit: 1,
    })
    directlySelectedSummary!.profileSummary.nodeCount = 999

    expect(directlySelected).toEqual(latestPreviousBaseline)
    expect(directlySelected).not.toBe(storedRows.get(latestPreviousBaseline.baselineRef))
    expect(directlySelectedSummary?.baselineRef).toBe(latestPreviousBaseline.baselineRef)
    expect(directlySelectedSummary?.baselineRef).not.toBe(currentBaseline.baselineRef)
    expect(summarizeDpmProfileBaselineRow(latestPreviousBaseline).profileSummary.nodeCount)
      .toBe(latestPreviousProfileArtifact.nodes.length)
  })

  it('rejects analysis reports that do not belong to the stored profile artifact', async () => {
    const repository = createDpmProfileBaselineRepository({
      upsertProfileBaseline: async () => undefined,
      getProfileBaseline: async () => undefined,
      listProfileBaselines: async () => [],
    })
    const profileArtifact = createKafkaProfileArtifact()
    const mismatchedProfileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const analysisReport = createDpmProfileAnalysisReport({ profileArtifact })

    await expect(repository.saveProfileBaseline({
      profileArtifact: mismatchedProfileArtifact,
      analysisReport,
    })).rejects.toThrow('profile baseline analysis report does not match profile artifact')
  })
})
