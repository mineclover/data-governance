import type { DpmProfileDiagnostic } from './profile-artifact-types.js'

export type DpmProfileConnectorValidationResult = {
  valid: boolean
  diagnostics: DpmProfileDiagnostic[]
}
