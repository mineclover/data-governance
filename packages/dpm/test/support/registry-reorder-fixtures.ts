import {
  createRegistrySnapshot,
  type RegistrySnapshot,
  type RegistrySnapshotInput,
} from '../../src/index.js'
import { readCommerceRegistrySnapshot } from './registry-yaml-fixtures.js'

export function createReorderedCommerceRegistrySnapshot(snapshot = readCommerceRegistrySnapshot()): RegistrySnapshot {
  const input: RegistrySnapshotInput = {
    datasetId: snapshot.datasetId,
    registryVersion: snapshot.registryVersion,
    canonicalKeyEncodingVersion: snapshot.canonicalKeyEncodingVersion,
    exportedAt: snapshot.exportedAt,
    relationships: [...snapshot.relationships].reverse(),
  }
  return createRegistrySnapshot(input)
}
