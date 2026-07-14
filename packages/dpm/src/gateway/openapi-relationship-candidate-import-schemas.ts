import {
  arrayOf,
  integerSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayRelationshipCandidateImportSchemas() {
  return {
    DpmCandidateImportRequest: requiredObjectSchema({
      datasetId: stringSchema(),
      generatedAt: stringSchema(),
      thresholds: ref('DpmDiscoveryThresholds'),
      candidates: arrayOf(ref('DpmRelationshipCandidateInput')),
      exclusions: arrayOf(ref('DpmExcludedRelationshipCandidate')),
    }, ['datasetId', 'candidates']),
    DpmCandidateImportResponse: requiredObjectSchema({
      imported: integerSchema(),
      rejected: integerSchema(),
      report: ref('DpmRelationshipDiscoveryReport'),
    }),
  } as const
}
