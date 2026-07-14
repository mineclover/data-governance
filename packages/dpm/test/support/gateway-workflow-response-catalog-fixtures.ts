import type {
  GatewayMinimalResponseCase,
} from './gateway-workflow-response-case-types.js'
import {
  gatewayDiagnostic,
} from './gateway-workflow-response-diagnostic-fixtures.js'

export const gatewayCatalogMinimalResponseCases = [
  ['DpmCatalogProfileResponse', {
    catalogSnapshotRef: 'catalog://commerce/v1',
    catalogVersionHash: 'sha256:test',
    diagnostics: [gatewayDiagnostic],
  }],
] as const satisfies readonly GatewayMinimalResponseCase[]

