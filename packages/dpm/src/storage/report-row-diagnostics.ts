import { createDpmDiagnostic } from '../validator/diagnostic-copy.js'
import type { DpmDiagnostic } from '../validator/diagnostic-types.js'

export function copyValidationReportDiagnostics(diagnostics: readonly DpmDiagnostic[]): DpmDiagnostic[] {
  return diagnostics.map(diagnostic => createDpmDiagnostic(diagnostic))
}
