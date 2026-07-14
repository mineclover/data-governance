import { createDpmGatewayPlanColumnSchemas } from './openapi-execution-plan-column-schemas.js'
import { createDpmGatewayPlanDataBindingSchemas } from './openapi-execution-plan-data-binding-schemas.js'
import { createDpmGatewayCompiledPlanEnvelopeSchemas } from './openapi-execution-plan-envelope-schemas.js'
import { createDpmGatewayPlanNamespaceSchemas } from './openapi-execution-plan-namespace-schemas.js'
import { createDpmGatewayPlanRelationshipSchemas } from './openapi-execution-plan-relationship-schemas.js'

export function createDpmGatewayCompiledPlanSchemas() {
  return {
    ...createDpmGatewayCompiledPlanEnvelopeSchemas(),
    ...createDpmGatewayPlanNamespaceSchemas(),
    ...createDpmGatewayPlanRelationshipSchemas(),
    ...createDpmGatewayPlanColumnSchemas(),
    ...createDpmGatewayPlanDataBindingSchemas(),
  } as const
}
