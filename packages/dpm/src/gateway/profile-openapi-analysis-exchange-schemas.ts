import {
  DPM_PROFILE_BASELINE_SELECTION_STRATEGIES,
} from '../storage/profile-baseline-selection-taxonomy.js'
import {
  informativeObjectSchema,
  integerSchema,
  ratioSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisExchangeGatewaySchemas() {
  return {
    DpmProfileBaselineRef: {
      oneOf: [
        requiredObjectSchema({
          baselineRef: stringSchema(),
        }),
        requiredObjectSchema({
          selectionStrategy: {
            type: 'string',
            enum: [...DPM_PROFILE_BASELINE_SELECTION_STRATEGIES],
          },
          limit: {
            ...integerSchema(),
            minimum: 1,
          },
        }, ['selectionStrategy']),
      ],
    },
    DpmProfileAnalysisPolicy: informativeObjectSchema({
      measuredRelationshipPresenceThreshold: ratioSchema(),
      measuredRelationshipConfidenceCap: ratioSchema(),
      lowPresenceRiskThreshold: ratioSchema(),
      highNullRiskThreshold: ratioSchema(),
      identifierKeyCandidateFallbackConfidence: ratioSchema(),
    }),
    DpmProfileAnalysisRequest: {
      ...requiredObjectSchema({
        profileArtifact: ref('DpmProfileArtifact'),
        previousProfileArtifact: ref('DpmProfileArtifact'),
        previousProfileBaseline: ref('DpmProfileBaselineRef'),
        policy: ref('DpmProfileAnalysisPolicy'),
        reportId: stringSchema(),
        analyzedAt: stringSchema(),
      }, ['profileArtifact']),
      not: {
        required: ['previousProfileArtifact', 'previousProfileBaseline'],
      },
    },
    DpmProfileAnalysisResponse: requiredObjectSchema({
      analysisReport: ref('DpmProfileAnalysisReport'),
    }),
  } as const
}
