import {
  byDiagnostic,
  byId,
} from './artifact-ordering.js'
import {
  copySourceDescriptor,
  sortEvidenceSources,
} from './artifact-source-copy.js'
import {
  copyEdge,
  copyMetric,
  copyNode,
} from './artifact-graph-copy.js'
import { copyDiagnostic } from './artifact-diagnostic-copy.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function copyDpmProfileArtifact(profile: DpmProfileArtifact): DpmProfileArtifact {
  return {
    kind: profile.kind,
    profileId: profile.profileId,
    datasetId: profile.datasetId,
    profileVersion: profile.profileVersion,
    createdAt: profile.createdAt,
    sources: profile.sources.map(copySourceDescriptor).sort(byId),
    evidenceSources: sortEvidenceSources(profile.evidenceSources),
    nodes: profile.nodes.map(copyNode).sort(byId),
    edges: profile.edges.map(copyEdge).sort(byId),
    metrics: profile.metrics.map(copyMetric).sort(byId),
    diagnostics: profile.diagnostics.map(copyDiagnostic).sort(byDiagnostic),
    freshness: copyProfileFreshness(profile.freshness),
  }
}

function copyProfileFreshness(
  freshness: DpmProfileArtifact['freshness'],
): DpmProfileArtifact['freshness'] {
  return {
    versionHash: freshness.versionHash,
    ...(freshness.sourceVersionHashes
      ? { sourceVersionHashes: sortSourceVersionHashes(freshness.sourceVersionHashes) }
      : {}),
  }
}

function sortSourceVersionHashes(
  hashes: Readonly<Record<string, string>>,
): Record<string, string> {
  const sorted: Record<string, string> = {}
  for (const key of Object.keys(hashes).sort()) {
    const value = hashes[key]
    if (value) sorted[key] = value
  }
  return sorted
}
