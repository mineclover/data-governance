import type { CatalogSnapshot } from '../catalog/types.js'
import type { RelationshipCatalogEndpointContext } from './relationship-catalog-endpoints.js'
import type { RelationshipCatalogParentKeyGateInput } from './relationship-catalog-parent-key-flow.js'
import type { RelationshipCatalogTableGateResult } from './relationship-catalog-table-gates.js'

export function createRelationshipCatalogParentKeyGateInput(input: {
  catalog: CatalogSnapshot
  relationship: RelationshipCatalogEndpointContext
  pointer: string
  tableGates: RelationshipCatalogTableGateResult
}): RelationshipCatalogParentKeyGateInput {
  return {
    catalog: input.catalog,
    relationshipName: input.relationship.relationshipName,
    pointer: input.pointer,
    ...(input.relationship.parentTable ? { parentTable: input.relationship.parentTable } : {}),
    parentColumns: input.relationship.parentColumns,
    parentTableUsable: input.tableGates.parentTableUsable,
  }
}
