import type { DpmProfileAnalysisInput } from './analysis-input-types.js'
import type { DpmProfileAnalysisPolicy } from './analysis-policy-types.js'
import { DPM_PROFILE_ANALYSIS_REPORT_KIND } from './analysis-report-kind.js'
import type { DpmProfileAnalysisReport } from './analysis-report-types.js'
import type { DpmProfileAnalysisReportSignals } from './analysis-report-signals.js'
import { copyDiagnostic } from './artifact-diagnostic-copy.js'
import { createDpmProfileAnalysisGraphDiagnostics } from './analysis-graph-diagnostics.js'
import {
  createDpmProfileAnalysisSummary,
  sortDpmProfileAnalysisDiagnostics,
} from './analysis-summary.js'

export function createDpmProfileAnalysisStructuralReport(
  input: DpmProfileAnalysisInput,
  signals: DpmProfileAnalysisReportSignals,
  analysisPolicy: DpmProfileAnalysisPolicy,
): Omit<DpmProfileAnalysisReport, 'freshness'> {
  const diagnostics = sortDpmProfileAnalysisDiagnostics([
    ...input.profileArtifact.diagnostics,
    ...createDpmProfileAnalysisGraphDiagnostics(input.profileArtifact),
  ].map(copyDiagnostic))

  return {
    kind: DPM_PROFILE_ANALYSIS_REPORT_KIND,
    reportId: input.reportId ?? `profile-analysis:${input.profileArtifact.profileId}:${input.profileArtifact.freshness.versionHash}`,
    profileId: input.profileArtifact.profileId,
    datasetId: input.profileArtifact.datasetId,
    profileVersion: input.profileArtifact.profileVersion,
    analyzedAt: input.analyzedAt ?? input.profileArtifact.createdAt,
    profileVersionHash: input.profileArtifact.freshness.versionHash,
    analysisPolicy: { ...analysisPolicy },
    ...signals,
    diagnostics,
    summary: createDpmProfileAnalysisSummary({
      profileArtifact: input.profileArtifact,
      diagnostics,
      relationshipHints: signals.relationshipHints,
      keyCandidates: signals.keyCandidates,
      riskIndicators: signals.riskIndicators,
      driftSignals: signals.driftSignals,
    }),
  }
}
