export const DPM_PROFILE_CAPTURE_MODES = [
  'fixture',
  'snapshot',
  'read_only',
  'manual',
] as const

export type DpmProfileCaptureMode = typeof DPM_PROFILE_CAPTURE_MODES[number]
