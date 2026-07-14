import {
  DISCOVERY_CANDIDATE_RECOMMENDATIONS,
  DISCOVERY_CONFIDENCE_LEVELS,
  DISCOVERY_EVIDENCE_KINDS,
  DISCOVERY_EXCLUDED_CANDIDATE_REASONS,
  DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES,
  REGISTRY_RELATIONSHIP_STATUSES,
} from '../../src/index.js'
import type { GatewayTaxonomyProjectionCase } from './gateway-schema-lookup.js'

export const workflowTaxonomyProjectionCases = [
  [
    'DpmRelationshipCandidate',
    ['properties', 'recommendation', 'enum'],
    DISCOVERY_CANDIDATE_RECOMMENDATIONS,
  ],
  [
    'DpmRelationshipCandidate',
    ['properties', 'type', 'enum'],
    DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES,
  ],
  [
    'DpmRelationshipCandidateInput',
    ['properties', 'type', 'enum'],
    DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES,
  ],
  [
    'DpmRelationshipCandidate',
    ['properties', 'confidence', 'properties', 'level', 'enum'],
    DISCOVERY_CONFIDENCE_LEVELS,
  ],
  [
    'DpmDiscoveryEvidence',
    ['properties', 'kind', 'enum'],
    DISCOVERY_EVIDENCE_KINDS,
  ],
  [
    'DpmExcludedRelationshipCandidate',
    ['properties', 'reason', 'enum'],
    DISCOVERY_EXCLUDED_CANDIDATE_REASONS,
  ],
  [
    'DpmRegistryRelationship',
    ['properties', 'status', 'enum'],
    REGISTRY_RELATIONSHIP_STATUSES,
  ],
] as const satisfies readonly GatewayTaxonomyProjectionCase[]
