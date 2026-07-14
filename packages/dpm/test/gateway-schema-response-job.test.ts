import { describe, expect, it } from 'vitest'

import { gatewayJobReportLifecycleStatusCases } from './support/gateway-job-response-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway job response schemas', () => {
  it('rejects job report statuses outside the persisted validation report lifecycle', () => {
    const schema = compileGatewayComponentSchema('DpmJobReport')

    for (const [label, status, expected] of gatewayJobReportLifecycleStatusCases) {
      expect(schema({
        jobId: 'job_001',
        status,
        validationReportRef: 'dpm-report:job_001',
        diagnostics: [],
      }), `${label}: ${JSON.stringify(schema.errors, null, 2)}`).toBe(expected)
    }
  })
})
