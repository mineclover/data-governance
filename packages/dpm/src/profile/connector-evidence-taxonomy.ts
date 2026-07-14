export const DPM_PROFILE_CONNECTOR_EVIDENCE_KINDS = [
  'source',
  'evidence_source',
  'node',
  'edge',
  'metric',
  'diagnostic',
] as const

export type DpmProfileConnectorEvidenceKind = typeof DPM_PROFILE_CONNECTOR_EVIDENCE_KINDS[number]
