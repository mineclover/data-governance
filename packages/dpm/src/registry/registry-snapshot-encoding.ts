import {
  resolveDpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import type { RegistrySnapshot } from './registry-snapshot-types.js'
import { createRegistrySnapshotIdentity } from './registry-identity.js'

export function normalizeRegistrySnapshotCanonicalKeyEncodingVersion(
  snapshot: RegistrySnapshot,
): RegistrySnapshot {
  const canonicalKeyEncodingVersion = resolveDpmCanonicalKeyEncodingVersion(
    snapshot.canonicalKeyEncodingVersion,
    'registry snapshot canonicalKeyEncodingVersion',
  )
  const expectedIdentity = createRegistrySnapshotIdentity(
    snapshot.datasetId,
    snapshot.registryVersion,
    canonicalKeyEncodingVersion,
  )
  if (snapshot.identity !== expectedIdentity) {
    throw new Error(
      `registry snapshot identity ${snapshot.identity} does not match canonical key encoding `
      + `${canonicalKeyEncodingVersion}; expected ${expectedIdentity}`,
    )
  }

  if (snapshot.canonicalKeyEncodingVersion === canonicalKeyEncodingVersion) return snapshot
  return {
    ...snapshot,
    canonicalKeyEncodingVersion,
  }
}
