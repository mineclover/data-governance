import type { SchemaSourceCoordinate } from '../contract/openapi-projection.js'
import type { DiscoveryExcludedCandidateReason } from './discovery-taxonomy.js'

export type ExcludedRelationshipCandidate = {
  id: string
  reason: DiscoveryExcludedCandidateReason
  message: string
  source?: SchemaSourceCoordinate
}
