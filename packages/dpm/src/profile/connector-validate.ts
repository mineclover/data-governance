import {
  collectDpmProfileConnectorDiagnostics,
} from './connector-validation.js'
import type {
  DpmProfileConnectorResult,
  DpmProfileConnectorValidationResult,
} from './connector-types.js'

export function validateDpmProfileConnectorResult(
  result: DpmProfileConnectorResult,
): DpmProfileConnectorValidationResult {
  const diagnostics = collectDpmProfileConnectorDiagnostics(result)

  return {
    valid: diagnostics.length === 0,
    diagnostics,
  }
}
