import { DPM_PROFILE_BASELINE_KIND } from '../storage/profile-baseline-kind.js'
import {
  arrayOf,
  integerSchema,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileBaselineGatewaySchemas() {
  return {
    DpmProfileBaselineSummaryListRequest: requiredObjectSchema({
      datasetId: stringSchema(),
      profileId: stringSchema(),
      limit: {
        ...integerSchema(),
        minimum: 1,
      },
    }, ['datasetId', 'profileId']),
    DpmProfileBaselineArtifactSummary: requiredObjectSchema({
      nodeCount: integerSchema(),
      edgeCount: integerSchema(),
      metricCount: integerSchema(),
      diagnosticCount: integerSchema(),
    }),
    DpmProfileBaselineSummary: requiredObjectSchema({
      kind: {
        type: 'string',
        enum: [DPM_PROFILE_BASELINE_KIND],
      },
      baselineRef: stringSchema(),
      datasetId: stringSchema(),
      profileId: stringSchema(),
      profileVersion: stringSchema(),
      profileVersionHash: stringSchema(),
      measurementId: stringSchema(),
      measuredAt: stringSchema(),
      measurementRunHash: stringSchema(),
      reportHash: stringSchema(),
      previousProfileVersionHash: stringSchema(),
      storedAt: stringSchema(),
      profileSummary: ref('DpmProfileBaselineArtifactSummary'),
      analysisSummary: ref('DpmProfileAnalysisSummary'),
      hasAnalysisReport: { type: 'boolean' },
    }, [
      'kind',
      'baselineRef',
      'datasetId',
      'profileId',
      'profileVersion',
      'profileVersionHash',
      'profileSummary',
      'hasAnalysisReport',
    ]),
    DpmProfileBaselineSummaryListResponse: requiredObjectSchema({
      baselineSummaries: arrayOf(ref('DpmProfileBaselineSummary')),
    }),
  } as const
}
