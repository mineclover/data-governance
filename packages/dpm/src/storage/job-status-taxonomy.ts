export const DPM_JOB_STATUSES = ['accepted', 'completed', 'failed'] as const

export type DpmJobStatus = typeof DPM_JOB_STATUSES[number]
