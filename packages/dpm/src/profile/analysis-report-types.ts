import type {
  DpmProfileArtifact,
} from './profile-artifact-types.js'
import type { DPM_PROFILE_ANALYSIS_REPORT_KIND } from './analysis-report-kind.js'
import type { DpmProfileAnalysisFreshness } from './analysis-report-freshness-types.js'
import type { DpmProfileAnalysisPolicy } from './analysis-policy-types.js'
import type {
  DpmProfileAnalysisCoverage,
  DpmProfileDriftSignal,
  DpmProfileKeyCandidate,
  DpmProfileRelationshipHintProposal,
  DpmProfileRiskIndicator,
} from './analysis-signal-types.js'
import type { DpmProfileAnalysisSummary } from './analysis-summary-types.js'

export { DPM_PROFILE_ANALYSIS_REPORT_KIND } from './analysis-report-kind.js'
export type { DpmProfileAnalysisFreshness } from './analysis-report-freshness-types.js'
export type { DpmProfileAnalysisSummary } from './analysis-summary-types.js'

export type DpmProfileAnalysisReport = {
  kind: typeof DPM_PROFILE_ANALYSIS_REPORT_KIND
  reportId: string
  profileId: string
  datasetId: string
  profileVersion: string
  analyzedAt: string
  profileVersionHash: string
  analysisPolicy: DpmProfileAnalysisPolicy
  coverage: DpmProfileAnalysisCoverage
  relationshipHints: DpmProfileRelationshipHintProposal[]
  keyCandidates: DpmProfileKeyCandidate[]
  driftSignals: DpmProfileDriftSignal[]
  riskIndicators: DpmProfileRiskIndicator[]
  diagnostics: DpmProfileArtifact['diagnostics']
  summary: DpmProfileAnalysisSummary
  freshness: DpmProfileAnalysisFreshness
}
