import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export function copyDpmProfileConnectorDiagnostic(
  diagnostic: DpmProfileDiagnostic,
): DpmProfileDiagnostic {
  return {
    severity: diagnostic.severity,
    code: diagnostic.code,
    message: diagnostic.message,
    ...(diagnostic.connectorId ? { connectorId: diagnostic.connectorId } : {}),
    ...(diagnostic.coordinate ? { coordinate: { ...diagnostic.coordinate } } : {}),
    ...(diagnostic.evidenceIds ? { evidenceIds: [...diagnostic.evidenceIds].sort() } : {}),
  }
}

export function byConnectorDiagnostic(
  left: DpmProfileDiagnostic,
  right: DpmProfileDiagnostic,
): number {
  const leftKey = `${left.severity}.${left.code}.${left.message}`
  const rightKey = `${right.severity}.${right.code}.${right.message}`
  return leftKey.localeCompare(rightKey)
}
