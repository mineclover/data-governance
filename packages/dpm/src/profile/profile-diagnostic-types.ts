import type { DpmProfileDiagnosticFamily } from './profile-diagnostic-taxonomy.js'
import type { DpmProfileCoordinate } from './profile-source-types.js'

export type DpmProfileDiagnostic = {
  severity: 'error' | 'warning' | 'info'
  code: `${DpmProfileDiagnosticFamily}${string}`
  message: string
  connectorId?: string
  coordinate?: DpmProfileCoordinate
  evidenceIds?: string[]
}
