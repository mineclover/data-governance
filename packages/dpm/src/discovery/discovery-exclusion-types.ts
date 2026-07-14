import type { SchemaSourceCoordinate } from '@oa-sdk/openapi-projection-contract'
import type { DiscoveryExcludedCandidateReason } from './discovery-taxonomy.js'

export type ExcludedRelationshipCandidate = {
  id: string
  reason: DiscoveryExcludedCandidateReason
  message: string
  source?: SchemaSourceCoordinate
}
