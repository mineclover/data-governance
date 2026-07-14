import type {
  GatewayMinimalResponseCase,
} from './gateway-workflow-response-case-types.js'

export const gatewayJobMinimalResponseCases = [
  ['DpmExecuteJobResponse', { jobId: 'job_001', status: 'accepted' }],
  ['DpmJobReport', {
    jobId: 'job_001',
    status: 'completed',
    validationReportRef: 'dpm-report:job_001',
    diagnostics: [],
  }],
] as const satisfies readonly GatewayMinimalResponseCase[]

