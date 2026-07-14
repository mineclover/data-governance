import type { ExcludedRelationshipCandidate } from './discovery-exclusion-types.js'
import { copyDiscoverySourceCoordinate } from './discovery-source-copy.js'

export function copyExcludedRelationshipCandidate(
  exclusion: ExcludedRelationshipCandidate,
): ExcludedRelationshipCandidate {
  return {
    id: exclusion.id,
    reason: exclusion.reason,
    message: exclusion.message,
    ...(exclusion.source ? { source: copyDiscoverySourceCoordinate(exclusion.source) } : {}),
  }
}
