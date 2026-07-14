import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'

export type RelationshipCatalogColumnCountGateResult = {
  diagnostics: DpmDiagnostic[]
  columnCountsMatch: boolean
}

export function validateRelationshipCatalogColumnCountGate(input: {
  relationshipName: string
  pointer: string
  childTable?: string
  parentColumns: readonly string[]
  childColumns: readonly string[]
}): RelationshipCatalogColumnCountGateResult {
  if (input.parentColumns.length === input.childColumns.length) {
    return {
      diagnostics: [],
      columnCountsMatch: true,
    }
  }

  return {
    diagnostics: [
      createDpmDiagnostic({
        severity: 'error',
        code: 'REL003',
        message: `Relationship ${input.relationshipName} parent and child columns must have the same length.`,
        sourcePointer: `${input.pointer}/child/columns`,
        catalogCoordinate: {
          table: input.childTable ?? '',
          columns: [...input.childColumns],
        },
      }),
    ],
    columnCountsMatch: false,
  }
}
