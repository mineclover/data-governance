import type {
  DpmProfileDriftSignal,
} from './analysis-signal-types.js'
import type { DpmProfileArtifact } from './profile-artifact-types.js'

export function analyzeFreshnessDriftSignals(
  current: DpmProfileArtifact,
  previous: DpmProfileArtifact,
): DpmProfileDriftSignal[] {
  const signals: DpmProfileDriftSignal[] = []
  if (current.freshness.versionHash !== previous.freshness.versionHash) {
    signals.push({
      id: 'drift:profile_hash_changed',
      kind: 'profile_hash_changed',
      severity: 'warning',
      previousValue: previous.freshness.versionHash,
      currentValue: current.freshness.versionHash,
      explanation: 'Profile artifact freshness changed.',
    })
  }

  for (const sourceId of unionKeys(previous.freshness.sourceVersionHashes ?? {}, current.freshness.sourceVersionHashes ?? {})) {
    const previousValue = previous.freshness.sourceVersionHashes?.[sourceId]
    const currentValue = current.freshness.sourceVersionHashes?.[sourceId]
    if (previousValue === currentValue) continue
    signals.push({
      id: `drift:source:${sourceId}`,
      kind: 'source_version_hash_changed',
      severity: 'warning',
      sourceId,
      ...(previousValue ? { previousValue } : {}),
      ...(currentValue ? { currentValue } : {}),
      explanation: `Source freshness changed for ${sourceId}.`,
    })
  }

  return signals
}

function unionKeys(left: Record<string, unknown>, right: Record<string, unknown>): string[] {
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].sort()
}
