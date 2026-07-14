import { DPM_DIAGNOSTIC_CODES } from '../validator/diagnostic-taxonomy.js'
import {
  arrayOf,
  informativeObjectSchema,
  integerSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayValidationSchemas() {
  return {
    DpmValidationResult: requiredObjectSchema({
      valid: { type: 'boolean' },
      diagnostics: arrayOf(ref('DpmDiagnostic')),
      summary: requiredObjectSchema({
        errors: integerSchema(),
        warnings: integerSchema(),
        infos: integerSchema(),
      }),
    }),
    DpmDiagnostic: requiredObjectSchema({
      severity: { type: 'string', enum: ['error', 'warning', 'info'] },
      code: { type: 'string', enum: [...DPM_DIAGNOSTIC_CODES] },
      message: stringSchema(),
      sourcePointer: stringSchema(),
      apiCoordinate: informativeObjectSchema({
        artifactId: stringSchema(),
        versionHash: stringSchema(),
        pointer: stringSchema(),
        operationId: stringSchema(),
      }),
      catalogCoordinate: informativeObjectSchema({
        table: stringSchema(),
        column: stringSchema(),
        columns: arrayOf(stringSchema()),
      }),
      registryCoordinate: informativeObjectSchema({
        datasetId: stringSchema(),
        registryVersion: stringSchema(),
        relationshipName: stringSchema(),
        relationshipVersion: stringSchema(),
        status: stringSchema(),
      }),
    }, ['severity', 'code', 'message', 'sourcePointer']),
  } as const
}
