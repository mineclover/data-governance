import type { DpmProfileDiagnostic } from './profile-artifact-types.js'
import { copyCoordinate } from './artifact-source-copy.js'

export function copyDiagnostic(diagnostic: DpmProfileDiagnostic): DpmProfileDiagnostic {
  return {
    severity: diagnostic.severity,
    code: diagnostic.code,
    message: diagnostic.message,
    ...(diagnostic.connectorId ? { connectorId: diagnostic.connectorId } : {}),
    ...(diagnostic.coordinate ? { coordinate: copyCoordinate(diagnostic.coordinate) } : {}),
    ...(diagnostic.evidenceIds ? { evidenceIds: [...diagnostic.evidenceIds].sort() } : {}),
  }
}
