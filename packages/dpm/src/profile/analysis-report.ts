import type { DpmProfileAnalysisReport } from './analysis-report-types.js'
import { computeDpmProfileAnalysisReportHash as computeReportHash } from './analysis-report-freshness.js'
import type { DpmProfileAnalysisInput } from './analysis-input-types.js'
import {
  computeDpmProfileAnalysisPolicyHash,
  resolveDpmProfileAnalysisPolicy,
} from './analysis-policy.js'
import { createDpmProfileAnalysisReportSignals } from './analysis-report-signals.js'
import { createDpmProfileAnalysisStructuralReport } from './analysis-report-structural.js'

export function createDpmProfileAnalysisReport(input: DpmProfileAnalysisInput): DpmProfileAnalysisReport {
  const analysisPolicy = resolveDpmProfileAnalysisPolicy(input.policy)
  const analysisPolicyHash = computeDpmProfileAnalysisPolicyHash(analysisPolicy)
  const signals = createDpmProfileAnalysisReportSignals(input, analysisPolicy)
  const structural = createDpmProfileAnalysisStructuralReport(input, signals, analysisPolicy)

  return {
    ...structural,
    freshness: {
      reportHash: computeReportHash(structural),
      profileVersionHash: input.profileArtifact.freshness.versionHash,
      analysisPolicyHash,
      ...(input.previousProfileArtifact ? { previousProfileVersionHash: input.previousProfileArtifact.freshness.versionHash } : {}),
    },
  }
}
