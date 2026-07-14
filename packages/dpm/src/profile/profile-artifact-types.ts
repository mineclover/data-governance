import type { DPM_PROFILE_ARTIFACT_KIND } from './profile-artifact-kind.js'
import type { DpmProfileDiagnostic } from './profile-diagnostic-types.js'
import type { DpmProfileFreshness } from './profile-freshness-types.js'
import type {
  DpmProfileEvidenceSource,
  DpmProfileSourceDescriptor,
} from './profile-source-types.js'
import type {
  DpmProfileEdge,
  DpmProfileMetric,
  DpmProfileNode,
} from './profile-graph-types.js'

export { DPM_PROFILE_ARTIFACT_KIND } from './profile-artifact-kind.js'
export type { DpmProfileDiagnostic } from './profile-diagnostic-types.js'
export type { DpmProfileFreshness } from './profile-freshness-types.js'

export type DpmProfileArtifact = {
  kind: typeof DPM_PROFILE_ARTIFACT_KIND
  profileId: string
  datasetId: string
  profileVersion: string
  createdAt: string
  sources: DpmProfileSourceDescriptor[]
  evidenceSources: Record<string, DpmProfileEvidenceSource>
  nodes: DpmProfileNode[]
  edges: DpmProfileEdge[]
  metrics: DpmProfileMetric[]
  diagnostics: DpmProfileDiagnostic[]
  freshness: DpmProfileFreshness
}
