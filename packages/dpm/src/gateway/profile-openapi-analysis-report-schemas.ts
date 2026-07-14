import { createDpmProfileAnalysisExchangeGatewaySchemas } from './profile-openapi-analysis-exchange-schemas.js'
import { createDpmProfileAnalysisFreshnessGatewaySchemas } from './profile-openapi-analysis-freshness-schemas.js'
import { createDpmProfileAnalysisReportEnvelopeGatewaySchemas } from './profile-openapi-analysis-report-envelope-schemas.js'
import { createDpmProfileAnalysisSummaryGatewaySchemas } from './profile-openapi-analysis-summary-schemas.js'

export function createDpmProfileAnalysisReportGatewaySchemas() {
  return {
    ...createDpmProfileAnalysisExchangeGatewaySchemas(),
    ...createDpmProfileAnalysisReportEnvelopeGatewaySchemas(),
    ...createDpmProfileAnalysisSummaryGatewaySchemas(),
    ...createDpmProfileAnalysisFreshnessGatewaySchemas(),
  } as const
}
