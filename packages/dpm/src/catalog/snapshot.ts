import { computeCatalogFreshnessHash } from './freshness.js'
import type {
  CatalogSnapshotInput,
} from './snapshot-input-types.js'
import type {
  CatalogSnapshot,
} from './snapshot-record-types.js'
import { createCatalogSnapshotStructural } from './snapshot-structural.js'

export function normalizeCatalogSnapshot(input: CatalogSnapshotInput): CatalogSnapshot {
  const structural = createCatalogSnapshotStructural(input)

  return {
    ...structural,
    freshness: {
      versionHash: computeCatalogFreshnessHash(structural),
      ...(input.sourceVersionHash ? { sourceVersionHash: input.sourceVersionHash } : {}),
    },
  }
}
