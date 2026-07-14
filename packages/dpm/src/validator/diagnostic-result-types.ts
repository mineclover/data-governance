import type {
  DpmApiCoordinate,
  DpmCatalogCoordinate,
  DpmRegistryCoordinate,
} from './diagnostic-coordinate-types.js'
import type {
  DpmDiagnosticCode,
  DpmDiagnosticSeverity,
} from './diagnostic-taxonomy.js'

export type DpmDiagnostic = {
  severity: DpmDiagnosticSeverity
  code: DpmDiagnosticCode
  message: string
  sourcePointer: string
  apiCoordinate?: DpmApiCoordinate
  catalogCoordinate?: DpmCatalogCoordinate
  registryCoordinate?: DpmRegistryCoordinate
}

export type DpmValidationSummary = {
  errors: number
  warnings: number
  infos: number
}

export type DpmValidationResult = {
  valid: boolean
  diagnostics: DpmDiagnostic[]
  summary: DpmValidationSummary
}
