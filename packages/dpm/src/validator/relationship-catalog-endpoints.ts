import type { ManifestRelationship } from './relationship-types.js'
import { toStringArray } from './relationship-utils.js'

export type RelationshipCatalogEndpointContext = {
  relationshipName: string
  parentTable?: string
  childTable?: string
  parentColumns: string[]
  childColumns: string[]
}

export function createRelationshipCatalogEndpointContext(
  relationship: ManifestRelationship,
): RelationshipCatalogEndpointContext {
  const parentTable = relationship.parent?.table
  const childTable = relationship.child?.table

  return {
    relationshipName: relationship.name ?? '',
    parentColumns: toStringArray(relationship.parent?.columns),
    childColumns: toStringArray(relationship.child?.columns),
    ...(parentTable ? { parentTable } : {}),
    ...(childTable ? { childTable } : {}),
  }
}
