export const DPM_COMPILED_PLAN_KIND = 'dpm.compiled-plan.v1' as const
export const DPM_COMPILED_PLAN_VERSIONS = ['1.0'] as const
export const DPM_PLAN_STALE_REASONS = [
  'catalog_version_hash_changed',
  'registry_version_changed',
] as const
export const DPM_RELATIONSHIP_STEP_CARDINALITIES = [
  'one_to_one',
  'one_to_many',
  'many_to_one',
  'many_to_many',
  'self_reference',
  'polymorphic',
  'temporal',
  'code_lookup',
] as const

export type DpmCompiledPlanVersion = typeof DPM_COMPILED_PLAN_VERSIONS[number]
export type DpmPlanStaleReason = typeof DPM_PLAN_STALE_REASONS[number]
export type DpmRelationshipStepCardinality = typeof DPM_RELATIONSHIP_STEP_CARDINALITIES[number]
