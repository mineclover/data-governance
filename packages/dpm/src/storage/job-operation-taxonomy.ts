export const DPM_JOB_OPERATIONS = ['compile', 'dry_run'] as const

export type DpmJobOperation = typeof DPM_JOB_OPERATIONS[number]
