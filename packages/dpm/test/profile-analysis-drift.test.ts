import { describe, expect, it } from 'vitest'

import {
  createDpmProfileAnalysisReport,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
  createKafkaProfileArtifactWithCustomerNoPresence,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis drift', () => {
  it('reports drift signals when profile evidence changes', () => {
    const previousProfileArtifact = createKafkaProfileArtifact()
    const profileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const report = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact,
    })

    expect(report.driftSignals).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'profile_hash_changed',
        severity: 'warning',
      }),
      expect.objectContaining({
        kind: 'metric_value_changed',
        metricId: 'metric:orders.created.value.customer.customer_no.presence',
        previousValue: 0.997,
        currentValue: 0.91,
      }),
    ]))
    expect(report.summary.driftSignalCount).toBeGreaterThan(0)
  })

  it('does not compare node and metric drift across different profile identities', () => {
    const previousProfileArtifact = {
      ...createKafkaProfileArtifact(),
      datasetId: 'other_dataset',
      profileId: 'profile:kafka:other-orders-created',
    }
    const profileArtifact = createKafkaProfileArtifactWithCustomerNoPresence(0.91)
    const report = createDpmProfileAnalysisReport({
      profileArtifact,
      previousProfileArtifact,
    })

    expect(report.driftSignals).toEqual([expect.objectContaining({
      id: 'drift:profile_identity_mismatch',
      kind: 'profile_identity_mismatch',
      severity: 'warning',
      previousValue: 'other_dataset:profile:kafka:other-orders-created',
      currentValue: `${profileArtifact.datasetId}:${profileArtifact.profileId}`,
    })])
    expect(report.driftSignals).not.toContainEqual(expect.objectContaining({
      kind: 'metric_value_changed',
    }))
    expect(report.summary.driftSignalCount).toBe(1)
  })
})
