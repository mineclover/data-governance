import type { DpmRelationshipStepCardinality } from './plan-taxonomy.js'

export function toRelationshipStepCardinality(relationshipType: string): DpmRelationshipStepCardinality {
  if (relationshipType === 'one_to_one') return 'one_to_one'
  if (relationshipType === 'one_to_many') return 'one_to_many'
  if (relationshipType === 'many_to_one') return 'many_to_one'
  if (relationshipType === 'many_to_many_edge') return 'many_to_many'
  if (relationshipType === 'self_reference') return 'self_reference'
  return relationshipType as DpmRelationshipStepCardinality
}
