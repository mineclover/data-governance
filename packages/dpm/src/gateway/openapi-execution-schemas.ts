import { createDpmGatewayDryRunSchemas } from './openapi-execution-dry-run-schemas.js'
import { createDpmGatewayCompiledPlanSchemas } from './openapi-execution-plan-schemas.js'
import {
  arrayOf,
  ref,
  requiredObjectSchema,
} from './openapi-schema.js'
import { createDpmGatewayValidationSchemas } from './openapi-validation-schemas.js'

export function createDpmGatewayExecutionSchemas() {
  return {
    DpmCompileResult: requiredObjectSchema({
      ok: { type: 'boolean' },
      plan: ref('DpmCompiledPlan'),
      diagnostics: arrayOf(ref('DpmDiagnostic')),
      validation: ref('DpmValidationResult'),
    }, ['ok']),
    ...createDpmGatewayCompiledPlanSchemas(),
    ...createDpmGatewayDryRunSchemas(),
    ...createDpmGatewayValidationSchemas(),
  } as const
}
