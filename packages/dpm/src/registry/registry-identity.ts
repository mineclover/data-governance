import {
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  resolveDpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import { frameWellFormedUtf8 } from '../model/utf8-frame.js'

export const REGISTRY_SNAPSHOT_KIND = 'dpm.relationship.registry-snapshot.v1' as const

export function createRegistrySnapshotIdentity(
  datasetId: string,
  registryVersion: string,
  canonicalKeyEncodingVersion?: DpmCanonicalKeyEncodingVersion,
): string {
  const encodingVersion = resolveDpmCanonicalKeyEncodingVersion(canonicalKeyEncodingVersion)
  if (encodingVersion === DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION) {
    return `${datasetId}@${registryVersion}`
  }

  return 'dpm.relationship.registry-snapshot.typed-v2'
    + `|d|${frameWellFormedUtf8(datasetId, 'registry snapshot datasetId')}`
    + `|r|${frameWellFormedUtf8(registryVersion, 'registry snapshot registryVersion')}`
}

export function createRegistryRelationshipIdentity(
  datasetId: string,
  relationshipName: string,
  version: string,
): string {
  return `${datasetId}/${relationshipName}@${version}`
}
