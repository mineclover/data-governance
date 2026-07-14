import type { DpmProfileAnalysisInput } from './analysis-input-types.js'
import type { DpmProfileAnalysisReport } from './analysis-report-types.js'
import {
  analyzeCoverage,
  analyzeKeyCandidates,
  analyzeRelationshipHints,
  analyzeRiskIndicators,
} from './analysis-compute.js'
import { resolveDpmProfileAnalysisPolicy } from './analysis-policy.js'
import type { DpmProfileAnalysisPolicy } from './analysis-policy-types.js'
import { analyzeDriftSignals } from './analysis-drift.js'

export type DpmProfileAnalysisReportSignals = Pick<
  DpmProfileAnalysisReport,
  'coverage' | 'relationshipHints' | 'keyCandidates' | 'driftSignals' | 'riskIndicators'
>

export function createDpmProfileAnalysisReportSignals(
  input: DpmProfileAnalysisInput,
  resolvedPolicy?: DpmProfileAnalysisPolicy,
): DpmProfileAnalysisReportSignals {
  const policy = resolvedPolicy ?? resolveDpmProfileAnalysisPolicy(input.policy)

  return {
    coverage: analyzeCoverage(input.profileArtifact),
    relationshipHints: analyzeRelationshipHints(input.profileArtifact, policy),
    keyCandidates: analyzeKeyCandidates(input.profileArtifact, policy),
    driftSignals: analyzeDriftSignals(input.profileArtifact, input.previousProfileArtifact),
    riskIndicators: analyzeRiskIndicators(input.profileArtifact, policy),
  }
}
