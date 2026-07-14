import { createDpmProfileAnalysisCoverageGatewaySchemas } from './profile-openapi-analysis-coverage-schemas.js'
import { createDpmProfileAnalysisDriftGatewaySchemas } from './profile-openapi-analysis-drift-schemas.js'
import { createDpmProfileAnalysisKeyCandidateGatewaySchemas } from './profile-openapi-analysis-key-candidate-schemas.js'
import { createDpmProfileAnalysisRelationshipHintGatewaySchemas } from './profile-openapi-analysis-relationship-hint-schemas.js'
import { createDpmProfileAnalysisRiskGatewaySchemas } from './profile-openapi-analysis-risk-schemas.js'

export function createDpmProfileAnalysisSignalGatewaySchemas() {
  return {
    ...createDpmProfileAnalysisCoverageGatewaySchemas(),
    ...createDpmProfileAnalysisRelationshipHintGatewaySchemas(),
    ...createDpmProfileAnalysisKeyCandidateGatewaySchemas(),
    ...createDpmProfileAnalysisDriftGatewaySchemas(),
    ...createDpmProfileAnalysisRiskGatewaySchemas(),
  } as const
}
