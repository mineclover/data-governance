export const DPM_PROFILE_EDGE_KINDS = [
  'contains',
  'references',
  'derived_from',
  'observed_in',
  'same_shape_as',
  'candidate_relationship',
  'schema_version_of',
] as const

export type DpmProfileEdgeKind = typeof DPM_PROFILE_EDGE_KINDS[number]
