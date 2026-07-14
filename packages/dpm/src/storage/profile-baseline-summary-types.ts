import type { DpmProfileAnalysisSummary } from '../profile/analysis-summary-types.js'
import type { DPM_PROFILE_BASELINE_KIND } from './profile-baseline-kind.js'

export type DpmProfileBaselineArtifactSummary = {
  nodeCount: number
  edgeCount: number
  metricCount: number
  diagnosticCount: number
}

export type DpmProfileBaselineSummary = {
  kind: typeof DPM_PROFILE_BASELINE_KIND
  baselineRef: string
  datasetId: string
  profileId: string
  profileVersion: string
  profileVersionHash: string
  measurementId?: string
  measuredAt?: string
  measurementRunHash?: string
  reportHash?: string
  previousProfileVersionHash?: string
  storedAt?: string
  profileSummary: DpmProfileBaselineArtifactSummary
  analysisSummary?: DpmProfileAnalysisSummary
  hasAnalysisReport: boolean
}
