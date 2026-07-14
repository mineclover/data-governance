import { parse } from 'yaml'

import { resolveDpmCanonicalKeyEncodingVersion } from '../model/canonical-key-encoding.js'
import type { RegistrySnapshotInput } from './registry-snapshot-types.js'
import { toRegistryRelationshipInput } from './registry-yaml-relationship.js'
import { optionalString, requireArray, requireRecord, requireString } from './registry-yaml-values.js'

export function registrySnapshotInputFromYaml(yamlText: string): RegistrySnapshotInput {
  const raw = parse(yamlText) as unknown
  return toRegistrySnapshotInput(raw)
}

function toRegistrySnapshotInput(raw: unknown): RegistrySnapshotInput {
  const record = requireRecord(raw, 'registry snapshot')
  const datasetId = requireString(record.datasetId ?? record.dataset_id, 'datasetId')
  const registryVersion = requireString(record.registryVersion ?? record.registry_version, 'registryVersion')
  const canonicalKeyEncodingVersion = resolveDpmCanonicalKeyEncodingVersion(
    record.canonicalKeyEncodingVersion ?? record.canonical_key_encoding_version,
    'registry snapshot canonicalKeyEncodingVersion',
  )
  const relationships = requireArray(record.relationships, 'relationships').map(toRegistryRelationshipInput)
  const exportedAt = optionalString(record.exportedAt ?? record.exported_at, 'exportedAt')

  return {
    datasetId,
    registryVersion,
    canonicalKeyEncodingVersion,
    ...(exportedAt ? { exportedAt } : {}),
    relationships,
  }
}
