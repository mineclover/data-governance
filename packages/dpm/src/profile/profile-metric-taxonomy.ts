export const DPM_PROFILE_METRIC_KINDS = [
  'row_count_estimate',
  'presence_ratio',
  'null_ratio',
  'distinct_ratio',
  'uniqueness_ratio',
  'inclusion_ratio',
  'orphan_ratio',
  'message_rate_estimate',
  'key_coverage_ratio',
  'schema_version_count',
] as const

export type DpmProfileMetricKind = typeof DPM_PROFILE_METRIC_KINDS[number]
