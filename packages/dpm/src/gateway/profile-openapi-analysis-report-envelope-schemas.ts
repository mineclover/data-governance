import { DPM_PROFILE_ANALYSIS_REPORT_KIND } from '../profile/analysis-report-kind.js'
import {
  arrayOf,
  ref,
  requiredObjectSchema,
  stringSchema,
} from './openapi-schema.js'

export function createDpmProfileAnalysisReportEnvelopeGatewaySchemas() {
  return {
    DpmProfileAnalysisReport: requiredObjectSchema({
      kind: { type: 'string', const: DPM_PROFILE_ANALYSIS_REPORT_KIND },
      reportId: stringSchema(),
      profileId: stringSchema(),
      datasetId: stringSchema(),
      profileVersion: stringSchema(),
      analyzedAt: stringSchema(),
      profileVersionHash: stringSchema(),
      analysisPolicy: ref('DpmProfileAnalysisPolicy'),
      coverage: ref('DpmProfileAnalysisCoverage'),
      relationshipHints: arrayOf(ref('DpmProfileRelationshipHintProposal')),
      keyCandidates: arrayOf(ref('DpmProfileKeyCandidate')),
      driftSignals: arrayOf(ref('DpmProfileDriftSignal')),
      riskIndicators: arrayOf(ref('DpmProfileRiskIndicator')),
      diagnostics: arrayOf(ref('DpmProfileDiagnostic')),
      summary: ref('DpmProfileAnalysisSummary'),
      freshness: ref('DpmProfileAnalysisFreshness'),
    }),
  } as const
}
