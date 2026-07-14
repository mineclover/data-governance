import type { DpmProfileAnalysisCoverage } from './analysis-coverage-types.js'
import type { DpmProfileAnalysisFreshness } from './analysis-report-freshness-types.js'
import type { DpmProfileAnalysisReport } from './analysis-report-types.js'
import type { DpmProfileAnalysisPolicy } from './analysis-policy-types.js'
import type { DpmProfileAnalysisSummary } from './analysis-summary-types.js'
import { sortDpmProfileAnalysisDiagnostics } from './analysis-summary.js'
import type {
  DpmProfileDriftSignal,
  DpmProfileKeyCandidate,
  DpmProfileRelationshipHintProposal,
  DpmProfileRiskIndicator,
} from './analysis-signal-types.js'
import { byId } from './analysis-ordering-utils.js'
import { copyDiagnostic } from './artifact-diagnostic-copy.js'

export function copyDpmProfileAnalysisReport(
  report: DpmProfileAnalysisReport,
): DpmProfileAnalysisReport {
  return {
    kind: report.kind,
    reportId: report.reportId,
    profileId: report.profileId,
    datasetId: report.datasetId,
    profileVersion: report.profileVersion,
    analyzedAt: report.analyzedAt,
    profileVersionHash: report.profileVersionHash,
    analysisPolicy: copyAnalysisPolicy(report.analysisPolicy),
    coverage: copyCoverage(report.coverage),
    relationshipHints: report.relationshipHints.map(copyRelationshipHint).sort(byId),
    keyCandidates: report.keyCandidates.map(copyKeyCandidate).sort(byId),
    driftSignals: report.driftSignals.map(copyDriftSignal).sort(byId),
    riskIndicators: report.riskIndicators.map(copyRiskIndicator).sort(byId),
    diagnostics: sortDpmProfileAnalysisDiagnostics(report.diagnostics.map(copyDiagnostic)),
    summary: copySummary(report.summary),
    freshness: copyFreshness(report.freshness),
  }
}

function copyCoverage(coverage: DpmProfileAnalysisCoverage): DpmProfileAnalysisCoverage {
  return {
    sourceKindCounts: copyCountMap(coverage.sourceKindCounts),
    nodeKindCounts: copyCountMap(coverage.nodeKindCounts),
    metricKindCounts: copyCountMap(coverage.metricKindCounts),
    measuredNodeCount: coverage.measuredNodeCount,
    measuredNodeRatio: coverage.measuredNodeRatio,
  }
}

function copyRelationshipHint(
  hint: DpmProfileRelationshipHintProposal,
): DpmProfileRelationshipHintProposal {
  return {
    id: hint.id,
    status: hint.status,
    source: hint.source,
    fromNodeId: hint.fromNodeId,
    ...(hint.hintNodeId ? { hintNodeId: hint.hintNodeId } : {}),
    ...(hint.targetRef ? { targetRef: hint.targetRef } : {}),
    confidence: hint.confidence,
    evidenceIds: [...hint.evidenceIds].sort(),
    explanation: hint.explanation,
  }
}

function copyKeyCandidate(candidate: DpmProfileKeyCandidate): DpmProfileKeyCandidate {
  return {
    id: candidate.id,
    kind: candidate.kind,
    nodeId: candidate.nodeId,
    confidence: candidate.confidence,
    reason: candidate.reason,
    evidenceIds: [...candidate.evidenceIds].sort(),
  }
}

function copyDriftSignal(signal: DpmProfileDriftSignal): DpmProfileDriftSignal {
  return {
    id: signal.id,
    kind: signal.kind,
    severity: signal.severity,
    ...(signal.nodeId ? { nodeId: signal.nodeId } : {}),
    ...(signal.metricId ? { metricId: signal.metricId } : {}),
    ...(signal.sourceId ? { sourceId: signal.sourceId } : {}),
    ...(signal.previousValue !== undefined ? { previousValue: signal.previousValue } : {}),
    ...(signal.currentValue !== undefined ? { currentValue: signal.currentValue } : {}),
    explanation: signal.explanation,
  }
}

function copyRiskIndicator(indicator: DpmProfileRiskIndicator): DpmProfileRiskIndicator {
  return {
    id: indicator.id,
    kind: indicator.kind,
    severity: indicator.severity,
    ...(indicator.nodeId ? { nodeId: indicator.nodeId } : {}),
    ...(indicator.metricId ? { metricId: indicator.metricId } : {}),
    evidenceIds: [...indicator.evidenceIds].sort(),
    explanation: indicator.explanation,
  }
}

function copySummary(summary: DpmProfileAnalysisSummary): DpmProfileAnalysisSummary {
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

function copyFreshness(freshness: DpmProfileAnalysisFreshness): DpmProfileAnalysisFreshness {
  return {
    reportHash: freshness.reportHash,
    profileVersionHash: freshness.profileVersionHash,
    analysisPolicyHash: freshness.analysisPolicyHash,
    ...(freshness.previousProfileVersionHash ? {
      previousProfileVersionHash: freshness.previousProfileVersionHash,
    } : {}),
  }
}

function copyAnalysisPolicy(policy: DpmProfileAnalysisPolicy): DpmProfileAnalysisPolicy {
  return { ...policy }
}

function copyCountMap<T extends string>(
  counts: Partial<Record<T, number>>,
): Partial<Record<T, number>> {
  const sorted: Partial<Record<T, number>> = {}
  for (const key of Object.keys(counts).sort() as T[]) {
    const value = counts[key]
    if (value !== undefined) sorted[key] = value
  }
  return sorted
}
