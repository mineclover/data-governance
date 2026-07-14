import {
  integerSchema,
  requiredObjectSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisSummaryGatewaySchemas() {
  return {
    DpmProfileAnalysisSummary: requiredObjectSchema({
      nodeCount: integerSchema(),
      edgeCount: integerSchema(),
      metricCount: integerSchema(),
      diagnosticCount: integerSchema(),
      relationshipHintCount: integerSchema(),
      keyCandidateCount: integerSchema(),
      riskIndicatorCount: integerSchema(),
      driftSignalCount: integerSchema(),
    }),
  } as const
}
