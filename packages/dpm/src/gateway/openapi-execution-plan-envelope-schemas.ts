import {
  DPM_COMPILED_PLAN_VERSIONS,
  DPM_PLAN_STALE_REASONS,
} from '../compiler/plan.js'
import { DPM_CANONICAL_KEY_ENCODING_VERSIONS } from '../model/canonical-key-encoding.js'
import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayCompiledPlanEnvelopeSchemas() {
  return {
    DpmCompiledPlan: requiredObjectSchema({
      kind: { type: 'string', const: 'dpm.compiled-plan.v1' },
      planVersion: { type: 'string', enum: [...DPM_COMPILED_PLAN_VERSIONS] },
      identity: stringSchema(),
      manifestId: stringSchema(),
      datasetId: stringSchema(),
      policyVersion: stringSchema(),
      canonicalKeyEncodingVersion: {
        type: 'string',
        enum: [...DPM_CANONICAL_KEY_ENCODING_VERSIONS],
      },
      manifestCatalogVersionHash: stringSchema(),
      dataBindingArtifact: ref('DpmNeutralDataBindingArtifact'),
      freshness: ref('DpmPlanFreshness'),
      stale: { type: 'boolean' },
      staleReasons: arrayOf({ type: 'string', enum: [...DPM_PLAN_STALE_REASONS] }),
      namespaceBindings: arrayOf(ref('DpmNamespaceBinding')),
      relationshipSteps: arrayOf(ref('DpmRelationshipStep')),
      columnSteps: arrayOf(ref('DpmColumnStep')),
    }, [
      'kind',
      'planVersion',
      'identity',
      'manifestId',
      'datasetId',
      'policyVersion',
      'canonicalKeyEncodingVersion',
      'freshness',
      'stale',
      'staleReasons',
      'namespaceBindings',
      'relationshipSteps',
      'columnSteps',
    ]),
    DpmPlanFreshness: requiredObjectSchema({
      manifestCatalogVersionHash: stringSchema(),
      catalogVersionHash: stringSchema(),
      registryVersion: stringSchema(),
      registryIdentity: stringSchema(),
      canonicalKeyEncodingVersion: {
        type: 'string',
        enum: [...DPM_CANONICAL_KEY_ENCODING_VERSIONS],
      },
      dataBindingFreshness: ref('DpmDataBindingFreshness'),
    }, [
      'catalogVersionHash',
      'registryVersion',
      'registryIdentity',
      'canonicalKeyEncodingVersion',
    ]),
  } as const
}
