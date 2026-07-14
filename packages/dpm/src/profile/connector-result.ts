import {
  sortDpmProfileConnectorSourceVersionHashes,
} from './connector-source-version-hashes.js'
import { createDpmProfileConnectorStructuralResult } from './connector-normalize.js'
import { computeDpmProfileConnectorRunHash } from './connector-run-hash.js'
import { DPM_PROFILE_CONNECTOR_RESULT_KIND } from './connector-result-kind.js'
import type {
  DpmProfileConnectorResult,
  DpmProfileConnectorResultInput,
} from './connector-types.js'

export function normalizeDpmProfileConnectorResult(input: DpmProfileConnectorResultInput): DpmProfileConnectorResult {
  const structural = createDpmProfileConnectorStructuralResult(input, DPM_PROFILE_CONNECTOR_RESULT_KIND)

  return {
    ...structural,
    freshness: {
      runHash: computeDpmProfileConnectorRunHash(structural),
      ...(input.profileArtifact ? { profileVersionHash: input.profileArtifact.freshness.versionHash } : {}),
      ...(input.profileArtifact?.freshness.sourceVersionHashes
        ? {
            sourceVersionHashes: sortDpmProfileConnectorSourceVersionHashes(
              input.profileArtifact.freshness.sourceVersionHashes,
            ),
          }
        : {}),
    },
  }
}
