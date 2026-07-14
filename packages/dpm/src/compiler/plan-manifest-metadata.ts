import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import {
  asRecord,
  asString,
} from './plan-value-utils.js'

export type DpmPlanManifestMetadata = {
  manifest: Record<string, unknown>
  datasetId: string
  policyVersion: string
  manifestId: string
  manifestCatalogVersionHash: string
  registryReference: Record<string, unknown>
}

export function readDpmPlanManifestMetadata(input: {
  manifest: unknown
  registry: RegistrySnapshot
}): DpmPlanManifestMetadata {
  const manifest = asRecord(input.manifest)
  const metadata = asRecord(manifest.metadata)
  const datasetId = asString(metadata.dataset_id) || input.registry.datasetId
  const policyVersion = asString(metadata.policy_version) || 'unversioned'
  const manifestCatalogVersionHash = asString(asRecord(manifest.catalog).version_hash)

  return {
    manifest,
    datasetId,
    policyVersion,
    manifestId: `${datasetId}@${policyVersion}`,
    manifestCatalogVersionHash,
    registryReference: asRecord(manifest.relationship_registry),
  }
}
