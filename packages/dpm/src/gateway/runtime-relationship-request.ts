import type {
  DpmGatewayRelationshipDiscoveryInput,
  DpmGatewayRelationshipDiscoveryRequest,
  DpmGatewayRelationshipDiscoverySnapshotResolver,
} from './runtime-relationship-types.js'

export type {
  DpmGatewayRelationshipDiscoveryRequest,
  DpmGatewayRelationshipDiscoverySnapshotResolver,
} from './runtime-relationship-types.js'

export async function resolveDpmGatewayRelationshipDiscoveryRuntimeInput(input: {
  request: DpmGatewayRelationshipDiscoveryRequest
  resolver: DpmGatewayRelationshipDiscoverySnapshotResolver
}): Promise<DpmGatewayRelationshipDiscoveryInput> {
  return {
    manifest: input.request.manifest,
    catalog: await input.resolver.resolveCatalogSnapshot(input.request.catalogSnapshot),
  }
}
