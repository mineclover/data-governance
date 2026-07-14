export const REGISTRY_RELATIONSHIP_KINDS = [
  'one_to_one',
  'one_to_many',
  'many_to_one',
  'many_to_many_edge',
  'self_reference',
  'polymorphic',
  'temporal',
  'code_lookup',
] as const

export type RegistryRelationshipKind = typeof REGISTRY_RELATIONSHIP_KINDS[number]
