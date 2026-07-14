import {
  DPM_PROFILE_CAPTURE_MODES,
  DPM_PROFILE_DRIFT_SIGNAL_KINDS,
  DPM_PROFILE_EDGE_KINDS,
  DPM_PROFILE_KEY_CANDIDATE_KINDS,
  DPM_PROFILE_METRIC_KINDS,
  DPM_PROFILE_NODE_KINDS,
  DPM_PROFILE_PROPOSAL_REVIEW_STATUSES,
  DPM_PROFILE_RELATIONSHIP_HINT_SOURCES,
  DPM_PROFILE_RELATIONSHIP_HINT_STATUSES,
  DPM_PROFILE_RISK_INDICATOR_KINDS,
  DPM_PROFILE_SOURCE_KINDS,
} from '../../src/index.js'
import type { GatewayTaxonomyProjectionCase } from './gateway-schema-lookup.js'

export const profileTaxonomyProjectionCases = [
  ['DpmProfileCoordinate', ['properties', 'kind', 'enum'], DPM_PROFILE_SOURCE_KINDS],
  ['DpmProfileSourceDescriptor', ['properties', 'kind', 'enum'], DPM_PROFILE_SOURCE_KINDS],
  ['DpmProfileSourceDescriptor', ['properties', 'captureMode', 'enum'], DPM_PROFILE_CAPTURE_MODES],
  ['DpmProfileNode', ['properties', 'kind', 'enum'], DPM_PROFILE_NODE_KINDS],
  ['DpmProfileEdge', ['properties', 'kind', 'enum'], DPM_PROFILE_EDGE_KINDS],
  ['DpmProfileMetric', ['properties', 'kind', 'enum'], DPM_PROFILE_METRIC_KINDS],
  ['DpmProfileRelationshipHintProposal', ['properties', 'status', 'enum'], DPM_PROFILE_RELATIONSHIP_HINT_STATUSES],
  ['DpmProfileRelationshipHintProposal', ['properties', 'source', 'enum'], DPM_PROFILE_RELATIONSHIP_HINT_SOURCES],
  ['DpmProfileKeyCandidate', ['properties', 'kind', 'enum'], DPM_PROFILE_KEY_CANDIDATE_KINDS],
  ['DpmProfileDriftSignal', ['properties', 'kind', 'enum'], DPM_PROFILE_DRIFT_SIGNAL_KINDS],
  ['DpmProfileRiskIndicator', ['properties', 'kind', 'enum'], DPM_PROFILE_RISK_INDICATOR_KINDS],
  ['DpmProfileProposalReviewRequest', ['properties', 'status', 'enum'], DPM_PROFILE_PROPOSAL_REVIEW_STATUSES],
] as const satisfies readonly GatewayTaxonomyProjectionCase[]
