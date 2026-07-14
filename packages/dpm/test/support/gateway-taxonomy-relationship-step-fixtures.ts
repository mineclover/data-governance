import {
  DPM_RELATIONSHIP_STEP_CARDINALITIES,
  REGISTRY_ORPHAN_POLICIES,
  REGISTRY_RELATIONSHIP_KINDS,
  REGISTRY_TRANSFORM_STRATEGIES,
} from '../../src/index.js'
import type { GatewayTaxonomyProjectionCase } from './gateway-schema-lookup.js'

export const relationshipStepTaxonomyProjectionCases = [
  ['DpmRelationshipStep', ['properties', 'relationshipType', 'enum'], REGISTRY_RELATIONSHIP_KINDS],
  ['DpmRelationshipStep', ['properties', 'cardinality', 'enum'], DPM_RELATIONSHIP_STEP_CARDINALITIES],
  ['DpmRelationshipStep', ['properties', 'transformStrategy', 'enum'], REGISTRY_TRANSFORM_STRATEGIES],
  ['DpmRelationshipStep', ['properties', 'orphanPolicy', 'enum'], REGISTRY_ORPHAN_POLICIES],
] as const satisfies readonly GatewayTaxonomyProjectionCase[]
