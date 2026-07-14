import {
  copyDiagnostic,
  copyEdge,
  copyMetric,
  copyNode,
  copySourceDescriptor,
  sortEvidenceSources,
} from './artifact-copy.js'
import type { DpmProfileArtifactInput } from './artifact-input-types.js'
import {
  byDiagnostic,
  byId,
} from './artifact-ordering.js'
import { DPM_PROFILE_ARTIFACT_KIND } from './profile-artifact-kind.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function createDpmProfileArtifactStructural(
  input: DpmProfileArtifactInput,
): Omit<DpmProfileArtifact, 'freshness'> {
  return {
    kind: DPM_PROFILE_ARTIFACT_KIND,
    profileId: input.profileId,
    datasetId: input.datasetId,
    profileVersion: input.profileVersion,
    createdAt: input.createdAt,
    sources: input.sources.map(copySourceDescriptor).sort(byId),
    evidenceSources: sortEvidenceSources(input.evidenceSources),
    nodes: input.nodes.map(copyNode).sort(byId),
    edges: input.edges.map(copyEdge).sort(byId),
    metrics: input.metrics.map(copyMetric).sort(byId),
    diagnostics: input.diagnostics.map(copyDiagnostic).sort(byDiagnostic),
  }
}
