import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import type { SafetyColumnGateContext } from './safety-column-types.js'

export function validateSafetyColumnIdentifierGates(context: SafetyColumnGateContext): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []

  if (context.role === 'direct_identifier' && context.transformType === 'keep') {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'SAF001',
      message: 'direct_identifier columns cannot use keep transform.',
      sourcePointer: `${context.pointer}/transform/type`,
    }))
  }
  if (context.role === 'foreign_identifier' && context.pii && !context.relationshipName) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'SAF002',
      message: 'pii=true foreign_identifier columns require a relationship reference.',
      sourcePointer: `${context.pointer}/relationship`,
    }))
  }
  if (context.pii && context.transformType === 'keep' && context.role !== 'direct_identifier') {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'SAF010',
      message: 'pii=true columns cannot leak raw values with keep transform.',
      sourcePointer: `${context.pointer}/transform/type`,
    }))
  }

  return diagnostics
}
