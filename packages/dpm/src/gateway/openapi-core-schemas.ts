import { createDpmGatewayCatalogSchemas } from './openapi-catalog-schemas.js'
import { createDpmGatewayCommonSchemas } from './openapi-common-schemas.js'
import { createDpmGatewayExecutionSchemas } from './openapi-execution-schemas.js'
import { createDpmGatewayJobSchemas } from './openapi-job-schemas.js'
import { createDpmGatewayManifestSchemas } from './openapi-manifest-schemas.js'
import { createDpmGatewayRelationshipSchemas } from './openapi-relationship-schemas.js'

export function createDpmGatewayCoreSchemas() {
  return {
    ...createDpmGatewayCommonSchemas(),
    ...createDpmGatewayCatalogSchemas(),
    ...createDpmGatewayRelationshipSchemas(),
    ...createDpmGatewayManifestSchemas(),
    ...createDpmGatewayJobSchemas(),
    ...createDpmGatewayExecutionSchemas(),
  } as const
}
