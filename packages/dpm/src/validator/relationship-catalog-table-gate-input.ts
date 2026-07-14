import type { RelationshipCatalogEndpointContext } from './relationship-catalog-endpoints.js'
import type { RelationshipCatalogTableGateInput } from './relationship-catalog-table-gates.js'

export function createRelationshipCatalogTableGateInput(input: {
  context: RelationshipCatalogTableGateInput['context']
  relationship: RelationshipCatalogEndpointContext
  pointer: string
}): RelationshipCatalogTableGateInput {
  return {
    context: input.context,
    relationshipName: input.relationship.relationshipName,
    pointer: input.pointer,
    ...(input.relationship.parentTable ? { parentTable: input.relationship.parentTable } : {}),
    ...(input.relationship.childTable ? { childTable: input.relationship.childTable } : {}),
  }
}
