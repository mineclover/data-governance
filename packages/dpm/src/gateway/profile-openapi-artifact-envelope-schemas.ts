import { DPM_PROFILE_ARTIFACT_KIND } from '../profile/profile-artifact-kind.js'
import {
  arrayOf,
  recordOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileArtifactEnvelopeGatewaySchemas() {
  return {
    DpmProfileDiagnostic: requiredObjectSchema({
      severity: { type: 'string', enum: ['error', 'warning', 'info'] },
      code: { type: 'string', pattern: '^(PROF|CONN)[0-9]{3}$' },
      message: stringSchema(),
      connectorId: stringSchema(),
      coordinate: ref('DpmProfileCoordinate'),
      evidenceIds: arrayOf(stringSchema()),
    }, ['severity', 'code', 'message']),
    DpmProfileFreshness: requiredObjectSchema({
      versionHash: stringSchema(),
      sourceVersionHashes: recordOf(stringSchema()),
    }, ['versionHash']),
    DpmProfileArtifact: requiredObjectSchema({
      kind: { type: 'string', const: DPM_PROFILE_ARTIFACT_KIND },
      profileId: stringSchema(),
      datasetId: stringSchema(),
      profileVersion: stringSchema(),
      createdAt: stringSchema(),
      sources: arrayOf(ref('DpmProfileSourceDescriptor')),
      evidenceSources: recordOf(ref('DpmProfileEvidenceSource')),
      nodes: arrayOf(ref('DpmProfileNode')),
      edges: arrayOf(ref('DpmProfileEdge')),
      metrics: arrayOf(ref('DpmProfileMetric')),
      diagnostics: arrayOf(ref('DpmProfileDiagnostic')),
      freshness: ref('DpmProfileFreshness'),
    }),
  } as const
}
