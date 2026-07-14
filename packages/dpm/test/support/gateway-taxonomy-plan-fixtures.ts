import {
  DPM_CANONICAL_KEY_ENCODING_VERSIONS,
  DPM_COMPILED_PLAN_VERSIONS,
  DPM_PLAN_STALE_REASONS,
} from '../../src/index.js'
import type { GatewayTaxonomyProjectionCase } from './gateway-schema-lookup.js'

export const compiledPlanTaxonomyProjectionCases = [
  ['DpmCompiledPlan', ['properties', 'planVersion', 'enum'], DPM_COMPILED_PLAN_VERSIONS],
  ['DpmCompiledPlan', ['properties', 'canonicalKeyEncodingVersion', 'enum'], DPM_CANONICAL_KEY_ENCODING_VERSIONS],
  ['DpmPlanFreshness', ['properties', 'canonicalKeyEncodingVersion', 'enum'], DPM_CANONICAL_KEY_ENCODING_VERSIONS],
  ['DpmRegistrySnapshotResponse', ['properties', 'canonicalKeyEncodingVersion', 'enum'], DPM_CANONICAL_KEY_ENCODING_VERSIONS],
  ['DpmCompiledPlan', ['properties', 'staleReasons', 'items', 'enum'], DPM_PLAN_STALE_REASONS],
] as const satisfies readonly GatewayTaxonomyProjectionCase[]
