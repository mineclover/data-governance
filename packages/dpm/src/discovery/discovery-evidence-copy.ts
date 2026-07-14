import type { DiscoveryEvidence } from './discovery-evidence-types.js'
import { copyDiscoverySourceCoordinate } from './discovery-source-copy.js'

export function copyDiscoveryEvidence(evidence: DiscoveryEvidence): DiscoveryEvidence {
  return {
    kind: evidence.kind,
    ...(evidence.score !== undefined ? { score: evidence.score } : {}),
    message: evidence.message,
    ...(evidence.source ? { source: copyDiscoverySourceCoordinate(evidence.source) } : {}),
    ...(evidence.metadata ? { metadata: copyDiscoveryMetadata(evidence.metadata) } : {}),
  }
}

function copyDiscoveryMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>
}
