import {
  DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION,
  isDpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import type { RelationshipRegistryReference } from './relationship-types.js'

export function validateRelationshipRegistryReference(input: {
  metadataDatasetId?: string
  registryReference?: RelationshipRegistryReference
  registry: RegistrySnapshot
}): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const registryDatasetId = input.registryReference?.dataset_id ?? input.registryReference?.datasetId
  const registryVersion = input.registryReference?.registry_version ?? input.registryReference?.registryVersion
  const rawCanonicalKeyEncodingVersion = input.registryReference?.canonical_key_encoding_version
    ?? input.registryReference?.canonicalKeyEncodingVersion
  const canonicalKeyEncodingVersion = rawCanonicalKeyEncodingVersion === undefined
    ? DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION
    : isDpmCanonicalKeyEncodingVersion(rawCanonicalKeyEncodingVersion)
      ? rawCanonicalKeyEncodingVersion
      : undefined
  const registryCanonicalKeyEncodingVersion = input.registry.canonicalKeyEncodingVersion
    ?? DPM_DEFAULT_CANONICAL_KEY_ENCODING_VERSION

  if (input.metadataDatasetId && input.metadataDatasetId !== input.registry.datasetId) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL011',
      message: `Manifest metadata dataset ${input.metadataDatasetId} does not match registry snapshot ${input.registry.datasetId}.`,
      sourcePointer: '/metadata/dataset_id',
      registryCoordinate: {
        datasetId: input.registry.datasetId,
        registryVersion: input.registry.registryVersion,
      },
    }))
  }

  if (registryDatasetId && registryDatasetId !== input.registry.datasetId) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL011',
      message: `Manifest registry dataset ${registryDatasetId} does not match snapshot ${input.registry.datasetId}.`,
      sourcePointer: '/relationship_registry/dataset_id',
      registryCoordinate: {
        datasetId: input.registry.datasetId,
        registryVersion: input.registry.registryVersion,
      },
    }))
  }
  if (registryVersion && registryVersion !== input.registry.registryVersion) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL011',
      message: `Manifest registry version ${registryVersion} does not match snapshot ${input.registry.registryVersion}.`,
      sourcePointer: '/relationship_registry/registry_version',
      registryCoordinate: {
        datasetId: input.registry.datasetId,
        registryVersion: input.registry.registryVersion,
      },
    }))
  }
  if (
    canonicalKeyEncodingVersion
    && canonicalKeyEncodingVersion !== registryCanonicalKeyEncodingVersion
  ) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL011',
      message: `Manifest canonical key encoding ${canonicalKeyEncodingVersion} does not match registry snapshot ${registryCanonicalKeyEncodingVersion}.`,
      sourcePointer: '/relationship_registry/canonical_key_encoding_version',
      registryCoordinate: {
        datasetId: input.registry.datasetId,
        registryVersion: input.registry.registryVersion,
      },
    }))
  }

  return diagnostics
}
