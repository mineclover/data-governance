import type {
  DpmProfileDriftSignal,
} from './analysis-signal-types.js'
import { analyzeFreshnessDriftSignals } from './analysis-drift-freshness.js'
import { analyzeIdentityDriftSignals } from './analysis-drift-identity.js'
import { analyzeMetricDriftSignals } from './analysis-drift-metrics.js'
import { analyzeNodeDriftSignals } from './analysis-drift-nodes.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeDriftSignals(
  current: DpmProfileArtifact,
  previous?: DpmProfileArtifact,
): DpmProfileDriftSignal[] {
  if (!previous) return []

  const identitySignals = analyzeIdentityDriftSignals(current, previous)
  if (identitySignals.length > 0) return identitySignals

  return [
    ...analyzeFreshnessDriftSignals(current, previous),
    ...analyzeNodeDriftSignals(current, previous),
    ...analyzeMetricDriftSignals(current, previous),
  ].sort(byId)
}

function byId<T extends { id: string }>(left: T, right: T): number {
  return left.id.localeCompare(right.id)
}
