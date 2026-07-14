import { describe, expect, it } from 'vitest'

import {
  expectedCommerceLowConfidenceWarningReasons,
  readCommerceDiscoveryReport,
} from './support/discovery-fixtures.js'

describe('DPM relationship discovery candidate rejection', () => {
  it('marks low-confidence and ambiguous candidates for rejection instead of approval', () => {
    const report = readCommerceDiscoveryReport()
    const lowConfidence = report.candidates.find(candidate => candidate.id === 'candidate:orders_status')

    expect(lowConfidence).toMatchObject({
      confidence: {
        score: 0.72,
        level: 'low',
      },
      recommendation: 'reject',
      executable: false,
    })
    expect(lowConfidence?.warnings).toEqual([...expectedCommerceLowConfidenceWarningReasons])
  })
})
