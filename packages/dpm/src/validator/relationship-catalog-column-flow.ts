import type { CatalogSnapshot } from '../catalog/types.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import { validateRelationshipCatalogColumnCountGate } from './relationship-catalog-column-count-gates.js'
import { validateRelationshipCatalogColumnCompatibility } from './relationship-catalog-column-gates.js'

export type RelationshipCatalogColumnGateInput = {
  catalog: CatalogSnapshot
  relationshipName: string
  pointer: string
  parentTable?: string
  childTable?: string
  parentColumns: readonly string[]
  childColumns: readonly string[]
  parentTableUsable: boolean
  childTableUsable: boolean
}

export function validateRelationshipCatalogColumnGates(
  input: RelationshipCatalogColumnGateInput,
): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const columnCountGate = validateRelationshipCatalogColumnCountGate({
    relationshipName: input.relationshipName,
    pointer: input.pointer,
    parentColumns: input.parentColumns,
    childColumns: input.childColumns,
    ...(input.childTable ? { childTable: input.childTable } : {}),
  })
  diagnostics.push(...columnCountGate.diagnostics)

  if (columnCountGate.columnCountsMatch && input.parentTableUsable && input.childTableUsable) {
    diagnostics.push(...validateRelationshipCatalogColumnCompatibility({
      catalog: input.catalog,
      relationshipName: input.relationshipName,
      pointer: input.pointer,
      parentTable: input.parentTable ?? '',
      childTable: input.childTable ?? '',
      parentColumns: [...input.parentColumns],
      childColumns: [...input.childColumns],
    }))
  }

  return diagnostics
}
