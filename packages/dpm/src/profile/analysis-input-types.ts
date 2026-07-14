import type {
  DpmProfileArtifact,
} from './profile-artifact-types.js'
import type {
  DpmProfileAnalysisPolicyInput,
} from './analysis-policy-types.js'

export type DpmProfileAnalysisInput = {
  profileArtifact: DpmProfileArtifact
  previousProfileArtifact?: DpmProfileArtifact
  policy?: DpmProfileAnalysisPolicyInput
  reportId?: string
  analyzedAt?: string
}
