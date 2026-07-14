import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export function connectorDiagnostic(
  code: DpmProfileDiagnostic['code'],
  message: string,
  connectorId: string,
): DpmProfileDiagnostic {
  return {
    severity: 'error',
    code,
    message,
    connectorId,
    coordinate: {
      kind: 'manual_import',
      path: connectorId,
    },
  }
}
