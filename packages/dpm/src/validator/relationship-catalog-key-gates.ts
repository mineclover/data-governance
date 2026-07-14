import type { CatalogSnapshot } from '../catalog/types.js'
import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import { sameColumns } from './relationship-utils.js'

export function validateRelationshipParentKeyGate(input: {
  catalog: CatalogSnapshot
  relationshipName: string
  pointer: string
  parentTable: string
  parentColumns: string[]
}): DpmDiagnostic[] {
  if (input.parentColumns.length === 0 || hasUniqueParentKey(input.catalog, input.parentTable, input.parentColumns)) {
    return []
  }

  return [
    createDpmDiagnostic({
      severity: 'error',
      code: 'REL005',
      message: `Relationship ${input.relationshipName} parent key must be a primary key, unique index, or unique candidate.`,
      sourcePointer: `${input.pointer}/parent/columns`,
      catalogCoordinate: {
        table: input.parentTable,
        columns: input.parentColumns,
      },
    }),
  ]
}

function hasUniqueParentKey(catalog: CatalogSnapshot, table: string, columns: readonly string[]): boolean {
  return (
    catalog.primaryKeys.some(candidate => candidate.table === table && sameColumns(candidate.columns, columns)) ||
    catalog.indexes.some(candidate => candidate.table === table && candidate.unique && sameColumns(candidate.columns, columns)) ||
    catalog.uniqueCandidates.some(candidate => candidate.table === table && sameColumns(candidate.columns, columns))
  )
}
