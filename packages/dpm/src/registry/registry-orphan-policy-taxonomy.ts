export const REGISTRY_ORPHAN_POLICIES = [
  'block',
  'warn',
  'tolerate',
  'tolerate_null',
  'create_placeholder_parent',
  'lookup_archive',
] as const

export type RegistryOrphanPolicy = typeof REGISTRY_ORPHAN_POLICIES[number]
