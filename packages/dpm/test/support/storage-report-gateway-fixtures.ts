export const expectedGatewayJobReport = {
  jobId: 'job_gateway_001',
  status: 'completed',
  validationReportRef: 'dpm-report:job_gateway_001',
  diagnostics: [],
} as const

export const expectedGatewayJobReportKeys = [
  'jobId',
  'status',
  'validationReportRef',
  'diagnostics',
] as const
