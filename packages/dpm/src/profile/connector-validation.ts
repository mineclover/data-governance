import type { DpmProfileConnectorResult } from './connector-types.js'
import {
  addDpmProfileConnectorCapabilityDiagnostics,
} from './connector-validation-capability-gates.js'
import {
  addDpmProfileConnectorGraphDiagnostics,
} from './connector-validation-graph-gates.js'
import {
  addDpmProfileConnectorPayloadDiagnostics,
} from './connector-validation-payload-gates.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export function collectDpmProfileConnectorDiagnostics(
  result: DpmProfileConnectorResult,
): DpmProfileDiagnostic[] {
  const diagnostics: DpmProfileDiagnostic[] = []

  addDpmProfileConnectorCapabilityDiagnostics(diagnostics, result)
  const canValidateGraph = addDpmProfileConnectorPayloadDiagnostics(diagnostics, result)
  if (canValidateGraph) addDpmProfileConnectorGraphDiagnostics(diagnostics, result)

  return diagnostics
}
