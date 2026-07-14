import { describe, expect, it } from 'vitest'

import {
  createDpmProfileAnalysisReport,
} from '../src/index.js'
import {
  createKafkaProfileArtifact,
} from './support/profile-analysis-fixtures.js'

describe('DPM profile analysis coverage', () => {
  it('reports coverage counts for graph nodes and measured metrics', () => {
    const report = createDpmProfileAnalysisReport({
      profileArtifact: createKafkaProfileArtifact(),
    })

    expect(report.coverage.nodeKindCounts.message_field).toBeGreaterThanOrEqual(5)
    expect(report.coverage.metricKindCounts.presence_ratio).toBeGreaterThanOrEqual(4)
    expect(report.coverage.measuredNodeRatio).toBeGreaterThan(0)
  })

  it('does not count edge metrics as measured nodes', () => {
    const profile = createKafkaProfileArtifact()
    const baseline = createDpmProfileAnalysisReport({ profileArtifact: profile })
    const edge = profile.edges[0]!
    const report = createDpmProfileAnalysisReport({
      profileArtifact: {
        ...profile,
        metrics: [
          ...profile.metrics,
          {
            id: `metric:${edge.id}:orphan_ratio`,
            kind: 'orphan_ratio',
            subjectId: edge.id,
            value: 0.05,
            unit: 'ratio',
            evidenceIds: edge.evidenceIds,
          },
        ],
      },
    })

    expect(report.coverage.measuredNodeCount).toBe(baseline.coverage.measuredNodeCount)
    expect(report.coverage.measuredNodeRatio).toBeLessThanOrEqual(1)
  })
})
