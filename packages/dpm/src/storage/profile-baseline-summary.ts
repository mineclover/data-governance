import type { DpmProfileAnalysisSummary } from '../profile/analysis-summary-types.js'
import { DPM_PROFILE_BASELINE_KIND } from './profile-baseline-kind.js'
import { copyDpmProfileBaselineRow } from './profile-baseline-row-builder.js'
import type { DpmProfileBaselineRow } from './profile-baseline-row-types.js'
import type {
  DpmProfileBaselineArtifactSummary,
  DpmProfileBaselineSummary,
} from './profile-baseline-summary-types.js'

export function summarizeDpmProfileBaselineRow(
  row: DpmProfileBaselineRow,
): DpmProfileBaselineSummary {
  const copied = copyDpmProfileBaselineRow(row)

  return {
    kind: copied.kind,
    baselineRef: copied.baselineRef,
    datasetId: copied.datasetId,
    profileId: copied.profileId,
    profileVersion: copied.profileVersion,
    profileVersionHash: copied.profileVersionHash,
    ...(copied.measurementId !== undefined ? { measurementId: copied.measurementId } : {}),
    ...(copied.measuredAt !== undefined ? { measuredAt: copied.measuredAt } : {}),
    ...(copied.measurementRunHash !== undefined ? { measurementRunHash: copied.measurementRunHash } : {}),
    ...(copied.reportHash !== undefined ? { reportHash: copied.reportHash } : {}),
    ...(copied.previousProfileVersionHash !== undefined
      ? { previousProfileVersionHash: copied.previousProfileVersionHash }
      : {}),
    ...(copied.storedAt !== undefined ? { storedAt: copied.storedAt } : {}),
    profileSummary: summarizeProfileArtifact(copied),
    ...(copied.analysisReport ? { analysisSummary: copyAnalysisSummary(copied.analysisReport.summary) } : {}),
    hasAnalysisReport: copied.analysisReport !== undefined,
  }
}

export function summarizeDpmProfileBaselineRows(
  rows: readonly DpmProfileBaselineRow[],
): DpmProfileBaselineSummary[] {
  return rows.map(summarizeDpmProfileBaselineRow)
}

export function copyDpmProfileBaselineSummary(
  summary: DpmProfileBaselineSummary,
): DpmProfileBaselineSummary {
  assertDpmProfileBaselineSummary(summary)

  return {
    kind: summary.kind,
    baselineRef: summary.baselineRef,
    datasetId: summary.datasetId,
    profileId: summary.profileId,
    profileVersion: summary.profileVersion,
    profileVersionHash: summary.profileVersionHash,
    ...(summary.measurementId !== undefined ? { measurementId: summary.measurementId } : {}),
    ...(summary.measuredAt !== undefined ? { measuredAt: summary.measuredAt } : {}),
    ...(summary.measurementRunHash !== undefined ? { measurementRunHash: summary.measurementRunHash } : {}),
    ...(summary.reportHash !== undefined ? { reportHash: summary.reportHash } : {}),
    ...(summary.previousProfileVersionHash !== undefined
      ? { previousProfileVersionHash: summary.previousProfileVersionHash }
      : {}),
    ...(summary.storedAt !== undefined ? { storedAt: summary.storedAt } : {}),
    profileSummary: {
      nodeCount: summary.profileSummary.nodeCount,
      edgeCount: summary.profileSummary.edgeCount,
      metricCount: summary.profileSummary.metricCount,
      diagnosticCount: summary.profileSummary.diagnosticCount,
    },
    ...(summary.analysisSummary ? { analysisSummary: copyAnalysisSummary(summary.analysisSummary) } : {}),
    hasAnalysisReport: summary.hasAnalysisReport,
  }
}

export function copyDpmProfileBaselineSummaries(
  summaries: readonly DpmProfileBaselineSummary[],
): DpmProfileBaselineSummary[] {
  return summaries.map(copyDpmProfileBaselineSummary)
}

export function assertDpmProfileBaselineSummary(
  summary: DpmProfileBaselineSummary,
): void {
  const issues = [
    summary.kind === DPM_PROFILE_BASELINE_KIND ? undefined : 'kind',
    ...requiredStringIssues(summary, [
      'baselineRef',
      'datasetId',
      'profileId',
      'profileVersion',
      'profileVersionHash',
    ]),
    ...optionalStringIssues(summary, [
      'measurementId',
      'measuredAt',
      'measurementRunHash',
      'reportHash',
      'previousProfileVersionHash',
      'storedAt',
    ]),
    ...summaryCountIssues('profileSummary', summary.profileSummary),
    typeof summary.hasAnalysisReport === 'boolean' ? undefined : 'hasAnalysisReport',
    summary.analysisSummary && !summary.hasAnalysisReport
      ? 'analysisSummary'
      : undefined,
    ...(summary.analysisSummary
      ? analysisSummaryCountIssues(summary.analysisSummary)
      : []),
  ].filter(Boolean)

  if (issues.length > 0) {
    throw new Error(`profile baseline summary is invalid: ${issues.join(', ')}`)
  }
}

function summarizeProfileArtifact(row: DpmProfileBaselineRow): DpmProfileBaselineArtifactSummary {
  return {
    nodeCount: row.profileArtifact.nodes.length,
    edgeCount: row.profileArtifact.edges.length,
    metricCount: row.profileArtifact.metrics.length,
    diagnosticCount: row.profileArtifact.diagnostics.length,
  }
}

function copyAnalysisSummary(summary: DpmProfileAnalysisSummary): DpmProfileAnalysisSummary {
  assertAnalysisSummaryCounts(summary)

  return {
    nodeCount: summary.nodeCount,
    edgeCount: summary.edgeCount,
    metricCount: summary.metricCount,
    diagnosticCount: summary.diagnosticCount,
    relationshipHintCount: summary.relationshipHintCount,
    keyCandidateCount: summary.keyCandidateCount,
    riskIndicatorCount: summary.riskIndicatorCount,
    driftSignalCount: summary.driftSignalCount,
  }
}

function requiredStringIssues(
  summary: DpmProfileBaselineSummary,
  keys: ReadonlyArray<keyof DpmProfileBaselineSummary>,
): Array<string | undefined> {
  return keys.map(key =>
    typeof summary[key] === 'string' && summary[key].length > 0
      ? undefined
      : String(key)
  )
}

function optionalStringIssues(
  summary: DpmProfileBaselineSummary,
  keys: ReadonlyArray<keyof DpmProfileBaselineSummary>,
): Array<string | undefined> {
  return keys.map(key => {
    const value = summary[key]
    return value === undefined || (typeof value === 'string' && value.length > 0)
      ? undefined
      : String(key)
  })
}

function summaryCountIssues(
  prefix: string,
  summary: DpmProfileBaselineArtifactSummary | undefined,
): Array<string | undefined> {
  if (!summary) return [prefix]

  return [
    countIssue(`${prefix}.nodeCount`, summary.nodeCount),
    countIssue(`${prefix}.edgeCount`, summary.edgeCount),
    countIssue(`${prefix}.metricCount`, summary.metricCount),
    countIssue(`${prefix}.diagnosticCount`, summary.diagnosticCount),
  ]
}

function analysisSummaryCountIssues(
  summary: DpmProfileAnalysisSummary,
): Array<string | undefined> {
  return [
    countIssue('analysisSummary.nodeCount', summary.nodeCount),
    countIssue('analysisSummary.edgeCount', summary.edgeCount),
    countIssue('analysisSummary.metricCount', summary.metricCount),
    countIssue('analysisSummary.diagnosticCount', summary.diagnosticCount),
    countIssue('analysisSummary.relationshipHintCount', summary.relationshipHintCount),
    countIssue('analysisSummary.keyCandidateCount', summary.keyCandidateCount),
    countIssue('analysisSummary.riskIndicatorCount', summary.riskIndicatorCount),
    countIssue('analysisSummary.driftSignalCount', summary.driftSignalCount),
  ]
}

function assertAnalysisSummaryCounts(summary: DpmProfileAnalysisSummary): void {
  const issues = analysisSummaryCountIssues(summary).filter(Boolean)
  if (issues.length > 0) {
    throw new Error(`profile baseline analysis summary is invalid: ${issues.join(', ')}`)
  }
}

function countIssue(label: string, value: number): string | undefined {
  return Number.isInteger(value) && value >= 0 ? undefined : label
}
