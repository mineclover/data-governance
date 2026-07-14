import type { DiscoveryEvidence } from './discovery-evidence-types.js'

export function compareDiscoveryEvidence(left: DiscoveryEvidence, right: DiscoveryEvidence): number {
  return `${left.kind}.${left.message}`.localeCompare(`${right.kind}.${right.message}`)
}
