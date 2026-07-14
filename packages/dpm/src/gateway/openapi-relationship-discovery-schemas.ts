import {
  DISCOVERY_CANDIDATE_RECOMMENDATIONS,
  DISCOVERY_CONFIDENCE_LEVELS,
  DISCOVERY_EVIDENCE_KINDS,
  DISCOVERY_EXCLUDED_CANDIDATE_REASONS,
  DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES,
} from '../discovery/discovery-taxonomy.js'
import {
  arrayOf,
  integerSchema,
  ratioSchema,
  ref,
  recordOf,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmGatewayRelationshipDiscoverySchemas() {
  return {
    DpmRelationshipDiscoveryRequest: requiredObjectSchema({
      manifest: ref('DpmManifestPolicy'),
      catalogSnapshot: ref('DpmSnapshotRef'),
    }),
    DpmDiscoverySourceCoordinate: {
      oneOf: [
        requiredObjectSchema({
          kind: { type: 'string', enum: ['file'] },
          filePath: stringSchema(),
          pointer: stringSchema(),
          line: integerSchema(),
          column: integerSchema(),
        }, ['kind', 'filePath', 'pointer']),
        requiredObjectSchema({
          kind: { type: 'string', enum: ['db'] },
          entity: stringSchema(),
          id: stringSchema(),
          pointer: stringSchema(),
        }),
      ],
    },
    DpmDiscoveryEvidence: requiredObjectSchema({
      kind: { type: 'string', enum: [...DISCOVERY_EVIDENCE_KINDS] },
      score: ratioSchema(),
      message: stringSchema(),
      source: ref('DpmDiscoverySourceCoordinate'),
      metadata: recordOf({}),
    }, ['kind', 'message']),
    DpmRelationshipDiscoveryEndpoint: requiredObjectSchema({
      table: stringSchema(),
      columns: arrayOf(stringSchema()),
    }),
    DpmDiscoveryThresholds: requiredObjectSchema({
      reviewMin: ratioSchema(),
      rejectBelow: ratioSchema(),
      highConfidenceMin: ratioSchema(),
      maxOrphanRatioBlocking: ratioSchema(),
    }),
    DpmRelationshipCandidateInput: requiredObjectSchema({
      id: stringSchema(),
      relationshipName: stringSchema(),
      type: { type: 'string', enum: [...DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES] },
      parent: ref('DpmRelationshipDiscoveryEndpoint'),
      child: ref('DpmRelationshipDiscoveryEndpoint'),
      confidenceScore: ratioSchema(),
      evidence: arrayOf(ref('DpmDiscoveryEvidence')),
      warnings: arrayOf(stringSchema()),
    }, ['id', 'relationshipName', 'type', 'parent', 'child', 'confidenceScore', 'evidence']),
    DpmRelationshipCandidate: requiredObjectSchema({
      id: stringSchema(),
      relationshipName: stringSchema(),
      type: { type: 'string', enum: [...DISCOVERY_RELATIONSHIP_CANDIDATE_TYPES] },
      parent: ref('DpmRelationshipDiscoveryEndpoint'),
      child: ref('DpmRelationshipDiscoveryEndpoint'),
      confidence: requiredObjectSchema({
        score: ratioSchema(),
        level: { type: 'string', enum: [...DISCOVERY_CONFIDENCE_LEVELS] },
      }),
      evidence: arrayOf(ref('DpmDiscoveryEvidence')),
      warnings: arrayOf(stringSchema()),
      recommendation: { type: 'string', enum: [...DISCOVERY_CANDIDATE_RECOMMENDATIONS] },
      executable: { type: 'boolean', const: false },
    }),
    DpmExcludedRelationshipCandidate: requiredObjectSchema({
      id: stringSchema(),
      reason: { type: 'string', enum: [...DISCOVERY_EXCLUDED_CANDIDATE_REASONS] },
      message: stringSchema(),
      source: ref('DpmDiscoverySourceCoordinate'),
    }, ['id', 'reason', 'message']),
    DpmRelationshipDiscoveryReport: requiredObjectSchema({
      kind: { type: 'string', enum: ['dpm.relationship.discovery-report.v1'] },
      datasetId: stringSchema(),
      generatedAt: stringSchema(),
      autoApproveEnabled: { type: 'boolean', const: false },
      thresholds: ref('DpmDiscoveryThresholds'),
      candidates: arrayOf(ref('DpmRelationshipCandidate')),
      exclusions: arrayOf(ref('DpmExcludedRelationshipCandidate')),
      diagnostics: arrayOf(ref('DpmDiscoveryEvidence')),
      summary: requiredObjectSchema({
        candidateCount: integerSchema(),
        reviewCount: integerSchema(),
        rejectCount: integerSchema(),
        excludedCount: integerSchema(),
      }),
    }, ['kind', 'datasetId', 'autoApproveEnabled', 'thresholds', 'candidates', 'exclusions', 'diagnostics', 'summary']),
  } as const
}
