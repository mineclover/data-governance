import {
  DPM_PROFILE_METRIC_KINDS,
  DPM_PROFILE_NODE_KINDS,
  DPM_PROFILE_SOURCE_KINDS,
} from '../profile/types.js'
import {
  countRecordSchema,
  integerSchema,
  ratioSchema,
  requiredObjectSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisCoverageGatewaySchemas() {
  return {
    DpmProfileAnalysisCoverage: requiredObjectSchema({
      sourceKindCounts: countRecordSchema(DPM_PROFILE_SOURCE_KINDS),
      nodeKindCounts: countRecordSchema(DPM_PROFILE_NODE_KINDS),
      metricKindCounts: countRecordSchema(DPM_PROFILE_METRIC_KINDS),
      measuredNodeCount: integerSchema(),
      measuredNodeRatio: ratioSchema(),
    }),
  } as const
}
