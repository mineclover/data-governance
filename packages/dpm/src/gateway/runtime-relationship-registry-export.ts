import { createRegistrySnapshot } from '../registry/registry-snapshot-factory.js'
import {
  normalizeRegistrySnapshotCanonicalKeyEncodingVersion,
} from '../registry/registry-snapshot-encoding.js'
import type {
  DpmGatewayRegistrySnapshotExportInput,
  DpmGatewayRegistrySnapshotExportResult,
} from './runtime-relationship-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'

export async function exportDpmRegistrySnapshotRuntime(
  input: DpmGatewayRegistrySnapshotExportInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayRegistrySnapshotExportResult>> {
  const exportedSnapshot = await input.registryRepository.exportSnapshot({
    datasetId: input.datasetId,
    registryVersion: input.registryVersion,
    ...(input.expectedCanonicalKeyEncodingVersion
      ? { expectedCanonicalKeyEncodingVersion: input.expectedCanonicalKeyEncodingVersion }
      : {}),
    ...(input.exportedAt ? { exportedAt: input.exportedAt } : {}),
  })
  const snapshot = normalizeRegistrySnapshotCanonicalKeyEncodingVersion(exportedSnapshot)
  if (
    input.expectedCanonicalKeyEncodingVersion
    && input.expectedCanonicalKeyEncodingVersion !== snapshot.canonicalKeyEncodingVersion
  ) {
    throw new Error(
      `DPM registry ${input.datasetId}@${input.registryVersion} expected canonical key encoding `
      + `${input.expectedCanonicalKeyEncodingVersion}, but repository returned `
      + `${snapshot.canonicalKeyEncodingVersion}.`,
    )
  }
  const result = createRegistrySnapshot({
    datasetId: snapshot.datasetId,
    registryVersion: snapshot.registryVersion,
    canonicalKeyEncodingVersion: snapshot.canonicalKeyEncodingVersion,
    ...(snapshot.exportedAt ? { exportedAt: snapshot.exportedAt } : {}),
    relationships: snapshot.relationships,
  })

  return createDpmGatewayRuntimeResponse({
    operationId: 'exportDpmRegistrySnapshot',
    statusCode: 200,
    command: 'export-registry-snapshot',
    result,
  })
}
