export const DPM_VALIDATION_REPORT_STATUSES = ['completed', 'failed'] as const

export type DpmValidationReportStatus = typeof DPM_VALIDATION_REPORT_STATUSES[number]
