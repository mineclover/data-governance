export const DPM_PROFILE_SOURCE_KINDS = [
  'postgresql_catalog',
  'openapi_projection',
  'kafka_topic_bundle',
  'query_log',
  'orm_metadata',
  'manual_import',
] as const

export type DpmProfileSourceKind = typeof DPM_PROFILE_SOURCE_KINDS[number]
