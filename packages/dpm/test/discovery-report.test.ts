import { describe, expect, it } from 'vitest'

import { DISCOVERY_REPORT_KIND } from '../src/index.js'
import { readCommerceDiscoveryReport } from './support/discovery-fixtures.js'

describe('DPM relationship discovery report shape', () => {
  it('creates a reviewable report without approving or executing candidates', () => {
    const report = readCommerceDiscoveryReport()

    expect(report.kind).toBe(DISCOVERY_REPORT_KIND)
    expect(report.autoApproveEnabled).toBe(false)
    expect(report.summary).toEqual({
      candidateCount: 2,
      reviewCount: 1,
      rejectCount: 1,
      excludedCount: 1,
    })
    expect(report.candidates[0]).toMatchObject({
      id: 'candidate:orders_customer',
      confidence: {
        score: 0.998,
        level: 'high',
      },
      recommendation: 'review',
      executable: false,
    })
    expect('status' in report.candidates[0]!).toBe(false)
    expect('approved' in report.candidates[0]!).toBe(false)
  })
})
