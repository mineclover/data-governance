export const DPM_PROFILE_NODE_KINDS = [
  'dataset',
  'schema',
  'table',
  'column',
  'topic',
  'partition',
  'message_key',
  'message_header',
  'message_field',
  'schema_subject',
  'relationship_hint',
] as const

export type DpmProfileNodeKind = typeof DPM_PROFILE_NODE_KINDS[number]
