import { describe, expect, it } from 'vitest'

import {
  createDpmProfileAnalysisReport,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis key candidates', () => {
  it('reports message keys and identifier-like fields as key candidates', () => {
    const report = createDpmProfileAnalysisReport({
      profileArtifact: createKafkaProfileArtifact(),
    })

    expect(report.keyCandidates).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'message_key',
        nodeId: 'node:key:orders.created',
        confidence: 0.998,
      }),
      expect.objectContaining({
        kind: 'identifier_like_field',
        nodeId: 'node:field:orders.created.value.customer.customer_no',
      }),
    ]))
  })
})
