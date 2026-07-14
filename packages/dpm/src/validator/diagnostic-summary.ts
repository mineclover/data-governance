import type {
  DpmDiagnostic,
  DpmValidationSummary,
} from './diagnostic-types.js'

export function summarizeDpmDiagnostics(diagnostics: readonly DpmDiagnostic[]): DpmValidationSummary {
  return {
    errors: diagnostics.filter(diagnostic => diagnostic.severity === 'error').length,
    warnings: diagnostics.filter(diagnostic => diagnostic.severity === 'warning').length,
    infos: diagnostics.filter(diagnostic => diagnostic.severity === 'info').length,
  }
}

export function sortDpmDiagnostics(diagnostics: readonly DpmDiagnostic[]): DpmDiagnostic[] {
  return [...diagnostics].sort((left, right) =>
    `${left.code}.${left.sourcePointer}.${left.message}`.localeCompare(
      `${right.code}.${right.sourcePointer}.${right.message}`,
    ),
  )
}
