import { describe, expect, it } from 'vitest'

import {
  createDpmProfileAnalysisReport,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis risk indicators', () => {
  it('reports privacy and evidence quality risks without raw values', () => {
    const report = createDpmProfileAnalysisReport({
      profileArtifact: createKafkaProfileArtifact(),
    })
    const serializedRisks = JSON.stringify(report.riskIndicators)

    expect(report.riskIndicators).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'identifier_like_field',
        nodeId: 'node:field:orders.created.value.customer.customer_no',
      }),
      expect.objectContaining({
        kind: 'high_null_ratio',
        metricId: 'metric:orders.created.value.order.promo_code.null',
      }),
    ]))
    expect(serializedRisks).not.toContain('rawSample')
    expect(serializedRisks).not.toContain('C-001')
  })
})
