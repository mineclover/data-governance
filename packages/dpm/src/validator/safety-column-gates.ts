import type { DpmDiagnostic } from './diagnostic-types.js'
import { createSafetyColumnGateContext } from './safety-column-context.js'
import { validateSafetyColumnIdentifierGates } from './safety-column-identifier-gates.js'
import { validateSafetyColumnRelationshipGates } from './safety-column-relationship-gates.js'
import type { SafetyColumnGateInput } from './safety-column-types.js'

export function validateSafetyColumnGates(input: SafetyColumnGateInput): DpmDiagnostic[] {
  const context = createSafetyColumnGateContext(input)

  return [
    ...validateSafetyColumnIdentifierGates(context),
    ...validateSafetyColumnRelationshipGates(context),
  ]
}
