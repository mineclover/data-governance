export const DPM_PROFILE_RELATIONSHIP_HINT_STATUSES = ['review'] as const
export const DPM_PROFILE_RELATIONSHIP_HINT_SOURCES = ['explicit_hint', 'measured_key_candidate'] as const
export const DPM_PROFILE_KEY_CANDIDATE_KINDS = ['message_key', 'identifier_like_field'] as const
export const DPM_PROFILE_RISK_INDICATOR_KINDS = ['identifier_like_field', 'high_null_ratio', 'low_presence_ratio'] as const
export const DPM_PROFILE_DRIFT_SIGNAL_KINDS = [
  'profile_identity_mismatch',
  'profile_hash_changed',
  'node_added',
  'node_removed',
  'metric_value_changed',
  'source_version_hash_changed',
] as const

export type DpmProfileRelationshipHintStatus = typeof DPM_PROFILE_RELATIONSHIP_HINT_STATUSES[number]
export type DpmProfileRelationshipHintSource = typeof DPM_PROFILE_RELATIONSHIP_HINT_SOURCES[number]
export type DpmProfileKeyCandidateKind = typeof DPM_PROFILE_KEY_CANDIDATE_KINDS[number]
export type DpmProfileRiskIndicatorKind = typeof DPM_PROFILE_RISK_INDICATOR_KINDS[number]
export type DpmProfileDriftSignalKind = typeof DPM_PROFILE_DRIFT_SIGNAL_KINDS[number]
