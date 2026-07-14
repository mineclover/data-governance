export const DISCOVERY_EVIDENCE_KINDS = [
  'column_name_similarity',
  'type_compatibility',
  'unique_candidate',
  'inclusion_dependency',
  'query_log',
  'orm_metadata',
  'bi_query_metadata',
  'service_code_hint',
] as const
export const DISCOVERY_CONFIDENCE_LEVELS = ['high', 'review', 'low'] as const
export const DISCOVERY_CANDIDATE_RECOMMENDATIONS = ['review', 'reject'] as const
export const DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES = [
  'one_to_one',
  'one_to_many',
  'many_to_one',
  'many_to_many_edge',
  'self_reference',
  'polymorphic',
  'temporal',
  'code_lookup',
] as const
export const DISCOVERY_EXCLUDED_CANDIDATE_REASONS = [
  'excluded_column_pattern',
  'type_mismatch',
  'metric_like_column',
  'insufficient_evidence',
] as const

export type DiscoveryEvidenceKind = typeof DISCOVERY_EVIDENCE_KINDS[number]
export type DiscoveryConfidenceLevel = typeof DISCOVERY_CONFIDENCE_LEVELS[number]
export type DiscoveryCandidateRecommendation = typeof DISCOVERY_CANDIDATE_RECOMMENDATIONS[number]
export type DiscoveryRelationshipCandidateType = typeof DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES[number]
export type DiscoveryExcludedCandidateReason = typeof DISCOVERY_EXCLUDED_CANDIDATE_REASONS[number]
