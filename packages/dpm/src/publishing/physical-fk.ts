import type { DpmPhysicalForeignKeyRecommendation } from './physical-fk-types.js'
import type { DpmRelationshipMetadata } from './relationship-types.js'

export function toPhysicalForeignKeyRecommendations(
  relationshipMetadata: readonly DpmRelationshipMetadata[],
): DpmPhysicalForeignKeyRecommendation[] {
  return relationshipMetadata.map(toPhysicalForeignKeyRecommendation)
}

function toPhysicalForeignKeyRecommendation(
  relationship: DpmRelationshipMetadata,
): DpmPhysicalForeignKeyRecommendation {
  return {
    kind: 'physical_fk_recommendation',
    relationship: relationship.name,
    childTable: relationship.childTable,
    childColumns: [...relationship.childColumns],
    parentTable: relationship.parentTable,
    parentColumns: [...relationship.parentColumns],
    applyMode: 'recommendation_only',
    mutation: 'none',
  }
}
