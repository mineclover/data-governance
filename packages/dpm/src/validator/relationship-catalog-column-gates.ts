import type { CatalogSnapshot } from '../catalog/types.js'
import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'

export function validateRelationshipCatalogColumnCompatibility(input: {
  catalog: CatalogSnapshot
  relationshipName: string
  pointer: string
  parentTable: string
  childTable: string
  parentColumns: string[]
  childColumns: string[]
}): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  input.parentColumns.forEach((parentColumn, index) => {
    const childColumn = input.childColumns[index]
    if (!childColumn) return
    const parent = input.catalog.columns.find(column => column.table === input.parentTable && column.name === parentColumn)
    const child = input.catalog.columns.find(column => column.table === input.childTable && column.name === childColumn)
    if (!parent || !child || parent.dataType !== child.dataType) {
      diagnostics.push(createDpmDiagnostic({
        severity: 'error',
        code: 'REL004',
        message: `Relationship ${input.relationshipName} columns must exist and be type-compatible.`,
        sourcePointer: `${input.pointer}/parent/columns/${index}`,
        catalogCoordinate: {
          table: input.parentTable,
          column: parentColumn,
        },
      }))
    }
  })
  return diagnostics
}
