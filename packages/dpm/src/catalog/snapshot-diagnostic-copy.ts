import type { SchemaDiagnostic } from '../contract/openapi-projection.js'

import { copySourceCoordinate } from './snapshot-source-copy.js'
import type { CatalogDiagnostic } from './diagnostic-types.js'

export function copyDiagnostic(diagnostic: CatalogDiagnostic | SchemaDiagnostic): CatalogDiagnostic {
  return {
    severity: diagnostic.severity,
    code: diagnostic.code,
    message: diagnostic.message,
    ...(diagnostic.source ? { source: copySourceCoordinate(diagnostic.source) } : {}),
  }
}
