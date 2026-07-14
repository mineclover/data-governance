export const DPM_PROFILE_CONNECTOR_STATUSES = [
  'completed',
  'completed_with_warnings',
  'failed',
] as const

export type DpmProfileConnectorStatus = typeof DPM_PROFILE_CONNECTOR_STATUSES[number]
