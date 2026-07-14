import { createRegistrySnapshot } from '../registry/registry-snapshot-factory.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type {
  DpmRegistryRowsToSnapshotInput,
} from './registry-repository-types.js'
import {
  resolveDpmRegistrySnapshotCanonicalKeyEncodingVersion,
} from './registry-row-canonical-key-encoding.js'
import { dpmRegistryRowToRelationshipInput } from './registry-row-relationship.js'

export function registryRowsToSnapshot(input: DpmRegistryRowsToSnapshotInput): RegistrySnapshot {
  const canonicalKeyEncodingVersion = resolveDpmRegistrySnapshotCanonicalKeyEncodingVersion(input)
  return createRegistrySnapshot({
    datasetId: input.datasetId,
    registryVersion: input.registryVersion,
    canonicalKeyEncodingVersion,
    ...(input.exportedAt ? { exportedAt: input.exportedAt } : {}),
    relationships: input.rows.map(row => dpmRegistryRowToRelationshipInput(input, row)),
  })
}
