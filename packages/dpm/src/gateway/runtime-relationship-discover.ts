import {
  createRelationshipDiscoveryReportFromCatalog,
} from '../discovery/catalog-relationship-candidates.js'
import type {
  DpmGatewayRelationshipDiscoveryInput,
  DpmGatewayRelationshipDiscoveryResult,
} from './runtime-relationship-types.js'
import { resolveDpmGatewayRuntimeCatalogSnapshot } from './runtime-manifest-catalog.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'

export async function discoverDpmRelationshipsRuntime(
  input: DpmGatewayRelationshipDiscoveryInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayRelationshipDiscoveryResult>> {
  const catalog = resolveDpmGatewayRuntimeCatalogSnapshot(input.catalog)

  return createDpmGatewayRuntimeResponse({
    operationId: 'discoverDpmRelationships',
    statusCode: 200,
    command: 'discover-relationships',
    result: createRelationshipDiscoveryReportFromCatalog({
      datasetId: readDiscoveryDatasetId(input.manifest, catalog),
      catalog,
      includedTables: readDiscoveryScopeTables(input.manifest),
      ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
      ...(input.thresholds ? { thresholds: input.thresholds } : {}),
    }),
  })
}

function readDiscoveryDatasetId(
  manifest: unknown,
  catalog: ReturnType<typeof resolveDpmGatewayRuntimeCatalogSnapshot>,
): string {
  if (isRecord(manifest)) {
    const metadata = manifest.metadata
    if (isRecord(metadata) && typeof metadata.dataset_id === 'string' && metadata.dataset_id.length > 0) {
      return metadata.dataset_id
    }
  }

  return catalog.source.kind === 'postgresql'
    ? catalog.source.database
    : catalog.source.projectionRef ?? catalog.source.projectionVersionHash
}

function readDiscoveryScopeTables(manifest: unknown): string[] {
  if (!isRecord(manifest)) return []
  const scope = manifest.scope
  if (!isRecord(scope) || !Array.isArray(scope.include_tables)) return []
  return scope.include_tables.filter((table): table is string => typeof table === 'string')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
