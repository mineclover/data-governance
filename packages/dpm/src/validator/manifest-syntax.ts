import { validateDpmManifestSchema } from '../schema/index.js'
import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'

export function validateManifestSyntax(manifest: unknown): DpmDiagnostic[] {
  return validateDpmManifestSchema(manifest).issues.map(issue => createDpmDiagnostic({
    severity: 'error',
    code: 'SYN001',
    message: issue.message,
    sourcePointer: issue.instancePath,
  }))
}
