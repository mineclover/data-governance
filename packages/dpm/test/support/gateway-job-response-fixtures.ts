export const gatewayJobReportLifecycleStatusCases = [
  ['pre-report job status', 'accepted', false],
  ['persisted failure status', 'failed', true],
] as const
