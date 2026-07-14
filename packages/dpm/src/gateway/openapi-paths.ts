import { createDpmCatalogGatewayPaths } from './openapi-catalog-paths.js'
import { createDpmJobGatewayPaths } from './openapi-job-paths.js'
import { createDpmManifestGatewayPaths } from './openapi-manifest-paths.js'
import { createDpmProfileGatewayPaths } from './openapi-profile-paths.js'
import { createDpmRelationshipGatewayPaths } from './openapi-relationship-paths.js'

export function createDpmGatewayPaths() {
  return {
    ...createDpmCatalogGatewayPaths(),
    ...createDpmProfileGatewayPaths(),
    ...createDpmRelationshipGatewayPaths(),
    ...createDpmManifestGatewayPaths(),
    ...createDpmJobGatewayPaths(),
  } as const
}
