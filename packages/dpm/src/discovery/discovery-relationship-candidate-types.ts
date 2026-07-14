import type {
  DiscoveryCandidateRecommendation,
  DiscoveryConfidenceLevel,
  DiscoveryRelationshipCandidateType,
} from './discovery-taxonomy.js'
import type { DiscoveryEvidence } from './discovery-evidence-types.js'
import type { RelationshipDiscoveryEndpoint } from './discovery-endpoint-types.js'

export type RelationshipCandidateInput = {
  id: string
  relationshipName: string
  type: DiscoveryRelationshipCandidateType
  parent: RelationshipDiscoveryEndpoint
  child: RelationshipDiscoveryEndpoint
  confidenceScore: number
  evidence: DiscoveryEvidence[]
  warnings?: string[]
}

export type RelationshipCandidate = {
  id: string
  relationshipName: string
  type: DiscoveryRelationshipCandidateType
  parent: RelationshipDiscoveryEndpoint
  child: RelationshipDiscoveryEndpoint
  confidence: {
    score: number
    level: DiscoveryConfidenceLevel
  }
  evidence: DiscoveryEvidence[]
  warnings: string[]
  recommendation: DiscoveryCandidateRecommendation
  executable: false
}
