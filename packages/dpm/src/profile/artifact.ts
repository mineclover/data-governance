import {
  computeDpmProfileFreshnessHash,
} from './artifact-freshness.js'
import type { DpmProfileArtifactInput } from './artifact-input-types.js'
import { createDpmProfileArtifactStructural } from './artifact-structural.js'
import { collectDpmProfileSourceVersionHashes } from './artifact-source-version-hashes.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export { computeDpmProfileFreshnessHash } from './artifact-freshness.js'
export type { DpmProfileArtifactInput } from './artifact-input-types.js'

export function normalizeDpmProfileArtifact(input: DpmProfileArtifactInput): DpmProfileArtifact {
  const structural = createDpmProfileArtifactStructural(input)

  const sourceVersionHashes = collectDpmProfileSourceVersionHashes(
    structural.sources,
    input.sourceVersionHashes,
  )

  return {
    ...structural,
    freshness: {
      versionHash: computeDpmProfileFreshnessHash(structural),
      ...(Object.keys(sourceVersionHashes).length > 0 ? { sourceVersionHashes } : {}),
    },
  }
}
