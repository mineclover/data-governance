import { createHash } from 'node:crypto'

import { DPM_PROFILE_ARTIFACT_KIND } from './profile-artifact-kind.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'
import { stableDpmProfileFreshnessStringify } from './artifact-freshness-serialization.js'

export type DpmProfileFreshnessHashInput =
  | Omit<DpmProfileArtifact, 'freshness'>
  | (Omit<DpmProfileArtifact, 'kind' | 'freshness'> & {
      sourceVersionHashes?: Readonly<Record<string, string>>
    })

export function computeDpmProfileFreshnessHash(input: DpmProfileFreshnessHashInput): string {
  const structural = 'kind' in input
    ? input
    : {
        kind: DPM_PROFILE_ARTIFACT_KIND,
        profileId: input.profileId,
        datasetId: input.datasetId,
        profileVersion: input.profileVersion,
        createdAt: input.createdAt,
        sources: input.sources,
        evidenceSources: input.evidenceSources,
        nodes: input.nodes,
        edges: input.edges,
        metrics: input.metrics,
        diagnostics: input.diagnostics,
      }

  return `sha256:${createHash('sha256')
    .update(stableDpmProfileFreshnessStringify(structural))
    .digest('hex')}`
}
