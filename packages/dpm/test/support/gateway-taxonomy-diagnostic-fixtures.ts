import {
  DPM_DIAGNOSTIC_CODES,
} from '../../src/index.js'
import type { GatewayTaxonomyProjectionCase } from './gateway-schema-lookup.js'

export const diagnosticTaxonomyProjectionCases = [
  ['DpmDiagnostic', ['properties', 'code', 'enum'], DPM_DIAGNOSTIC_CODES],
] as const satisfies readonly GatewayTaxonomyProjectionCase[]
