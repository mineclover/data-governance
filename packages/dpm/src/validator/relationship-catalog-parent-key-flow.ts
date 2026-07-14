import type { CatalogSnapshot } from '../catalog/types.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import { validateRelationshipParentKeyGate } from './relationship-catalog-key-gates.js'

export type RelationshipCatalogParentKeyGateInput = {
  catalog: CatalogSnapshot
  relationshipName: string
  pointer: string
  parentTable?: string
  parentColumns: readonly string[]
  parentTableUsable: boolean
}

export function validateRelationshipCatalogParentKeyGate(
  input: RelationshipCatalogParentKeyGateInput,
): DpmDiagnostic[] {
  if (!input.parentTableUsable || !input.parentTable) return []

  return validateRelationshipParentKeyGate({
    catalog: input.catalog,
    relationshipName: input.relationshipName,
    pointer: input.pointer,
    parentTable: input.parentTable,
    parentColumns: [...input.parentColumns],
  })
}
