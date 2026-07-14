import type { DpmProfileMetricKind } from './profile-metric-taxonomy.js'
import type { DpmProfileNodeKind } from './profile-node-taxonomy.js'
import type { DpmProfileSourceKind } from './profile-source-taxonomy.js'

export type DpmProfileAnalysisCoverage = {
  sourceKindCounts: Partial<Record<DpmProfileSourceKind, number>>
  nodeKindCounts: Partial<Record<DpmProfileNodeKind, number>>
  metricKindCounts: Partial<Record<DpmProfileMetricKind, number>>
  measuredNodeCount: number
  measuredNodeRatio: number
}
