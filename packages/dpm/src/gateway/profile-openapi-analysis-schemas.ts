import { createDpmProfileAnalysisReportGatewaySchemas } from './profile-openapi-analysis-report-schemas.js'
import { createDpmProfileAnalysisSignalGatewaySchemas } from './profile-openapi-analysis-signal-schemas.js'

export function createDpmProfileAnalysisGatewaySchemas() {
  return {
    ...createDpmProfileAnalysisReportGatewaySchemas(),
    ...createDpmProfileAnalysisSignalGatewaySchemas(),
  } as const
}
