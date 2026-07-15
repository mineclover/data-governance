import type { SchemaDiagnostic } from '../contract/openapi-projection.js'

import type { CatalogDiagnostic } from './diagnostic-types.js'

export function toCatalogDiagnostic(diagnostic: SchemaDiagnostic): CatalogDiagnostic {
  return {
    severity: diagnostic.severity,
    code: diagnostic.code,
    message: diagnostic.message,
    ...(diagnostic.source ? { source: diagnostic.source } : {}),
  }
}
