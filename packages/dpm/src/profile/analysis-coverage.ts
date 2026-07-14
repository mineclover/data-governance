import type { DpmProfileAnalysisCoverage } from './analysis-signal-types.js'
import {
  countBy,
} from './analysis-ordering-utils.js'
import {
  roundRatio,
} from './analysis-metric-utils.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeCoverage(profile: DpmProfileArtifact): DpmProfileAnalysisCoverage {
  const nodeIds = new Set(profile.nodes.map(node => node.id))
  const measuredNodeIds = new Set(
    profile.metrics
      .map(metric => metric.subjectId)
      .filter(subjectId => nodeIds.has(subjectId)),
  )

  return {
    sourceKindCounts: countBy(profile.sources, source => source.kind),
    nodeKindCounts: countBy(profile.nodes, node => node.kind),
    metricKindCounts: countBy(profile.metrics, metric => metric.kind),
    measuredNodeCount: measuredNodeIds.size,
    measuredNodeRatio: profile.nodes.length > 0 ? roundRatio(measuredNodeIds.size / profile.nodes.length) : 0,
  }
}
