export const REGISTRY_TRANSFORM_STRATEGIES = ['entity_token', 'relationship_token', 'keep_code'] as const

export type RegistryTransformStrategy = typeof REGISTRY_TRANSFORM_STRATEGIES[number]
