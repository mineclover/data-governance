export const REGISTRY_RELATIONSHIP_STATUSES = [
  'candidate',
  'proposed',
  'approved',
  'rejected',
  'deprecated',
  'superseded',
] as const

export type RegistryRelationshipStatus = typeof REGISTRY_RELATIONSHIP_STATUSES[number]
