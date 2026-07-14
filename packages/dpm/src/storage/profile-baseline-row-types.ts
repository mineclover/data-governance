import type { DpmProfileAnalysisReport } from '../profile/analysis-report-types.js'
import type { DpmProfileArtifact } from '../profile/profile-artifact-types.js'
import type { DPM_PROFILE_BASELINE_KIND } from './profile-baseline-kind.js'

export type DpmProfileBaselineRow = {
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
  profileArtifact: DpmProfileArtifact
  analysisReport?: DpmProfileAnalysisReport
  storedAt?: string
}
