import type {
  GatewayMinimalResponseCase,
} from './gateway-workflow-response-case-types.js'
import {
  gatewayCatalogMinimalResponseCases,
} from './gateway-workflow-response-catalog-fixtures.js'
import {
  gatewayJobMinimalResponseCases,
} from './gateway-workflow-response-job-fixtures.js'
import {
  gatewayProfileMinimalResponseCases,
} from './gateway-workflow-response-profile-fixtures.js'
import {
  gatewayRelationshipMinimalResponseCases,
} from './gateway-workflow-response-relationship-fixtures.js'

export const gatewayMinimalResponseCases = [
  ...gatewayCatalogMinimalResponseCases,
  ...gatewayProfileMinimalResponseCases,
  ...gatewayRelationshipMinimalResponseCases,
  ...gatewayJobMinimalResponseCases,
] as const satisfies readonly GatewayMinimalResponseCase[]
