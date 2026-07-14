import { describe, expect, it } from 'vitest'

import {
  expectedCommerceDiscoveryEvidenceKinds,
  readCommerceDiscoveryReport,
} from './support/discovery-fixtures.js'

describe('DPM relationship discovery evidence', () => {
  it('preserves optional query log and ORM evidence without making it required', () => {
    const report = readCommerceDiscoveryReport()
    const evidenceKinds = report.candidates[0]?.evidence.map(evidence => evidence.kind)

    expect(evidenceKinds).toEqual([...expectedCommerceDiscoveryEvidenceKinds])
    expect(report.candidates[0]?.evidence.find(evidence => evidence.kind === 'query_log')?.metadata).toEqual({
      sampleCount: 128,
    })
  })
})
