import { createDpmGatewayRelationshipApprovalSchemas } from './openapi-relationship-approval-schemas.js'
import { createDpmGatewayRelationshipCandidateImportSchemas } from './openapi-relationship-candidate-import-schemas.js'
import { createDpmGatewayRelationshipDiscoverySchemas } from './openapi-relationship-discovery-schemas.js'
import { createDpmGatewayRelationshipRegistrySchemas } from './openapi-relationship-registry-schemas.js'

export function createDpmGatewayRelationshipSchemas() {
  return {
    ...createDpmGatewayRelationshipDiscoverySchemas(),
    ...createDpmGatewayRelationshipCandidateImportSchemas(),
    ...createDpmGatewayRelationshipApprovalSchemas(),
    ...createDpmGatewayRelationshipRegistrySchemas(),
  } as const
}
