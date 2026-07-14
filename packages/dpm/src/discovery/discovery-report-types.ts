import type {
  RelationshipCandidate,
  RelationshipCandidateInput,
} from './discovery-relationship-candidate-types.js'
import type { DiscoveryEvidence } from './discovery-evidence-types.js'
import type { ExcludedRelationshipCandidate } from './discovery-exclusion-types.js'
import type { DISCOVERY_REPORT_KIND } from './report-kind.js'
import type { DiscoveryThresholds } from './discovery-threshold-types.js'

export type RelationshipDiscoveryReportInput = {
  datasetId: string
  generatedAt?: string
  thresholds?: Partial<DiscoveryThresholds>
  candidates: RelationshipCandidateInput[]
  exclusions?: ExcludedRelationshipCandidate[]
  diagnostics?: DiscoveryEvidence[]
}

export type RelationshipDiscoveryReport = {
  kind: typeof DISCOVERY_REPORT_KIND
  datasetId: string
  generatedAt?: string
  autoApproveEnabled: false
  thresholds: DiscoveryThresholds
  candidates: RelationshipCandidate[]
  exclusions: ExcludedRelationshipCandidate[]
  diagnostics: DiscoveryEvidence[]
  summary: {
    candidateCount: number
    reviewCount: number
    rejectCount: number
    excludedCount: number
  }
}
