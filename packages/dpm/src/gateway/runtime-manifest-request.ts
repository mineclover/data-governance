import type { DpmGatewayRuntimeManifestInput } from './runtime-manifest-types.js'
import type {
  DpmGatewayManifestRequest,
  DpmGatewayManifestSnapshotResolver,
} from './runtime-manifest-request-types.js'

export type {
  DpmGatewayManifestRequest,
  DpmGatewayManifestSnapshotResolver,
  DpmGatewaySnapshotRef,
} from './runtime-manifest-request-types.js'

export async function resolveDpmGatewayManifestRuntimeInput(input: {
  request: DpmGatewayManifestRequest
  resolver: DpmGatewayManifestSnapshotResolver
}): Promise<DpmGatewayRuntimeManifestInput> {
  const [catalog, registry] = await Promise.all([
    input.resolver.resolveCatalogSnapshot(input.request.catalogSnapshot),
    input.resolver.resolveRegistrySnapshot(input.request.registrySnapshot),
  ])

  return {
    manifest: input.request.manifest,
    catalog,
    registry,
    ...(input.request.estimatedRows ? { estimatedRows: { ...input.request.estimatedRows } } : {}),
  }
}
