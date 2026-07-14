import { createDpmProfileAnalysisReport } from '../profile/analysis-report.js'
import type {
  DpmGatewayProfileAnalysisInput,
  DpmGatewayProfileAnalysisResult,
} from './runtime-profile-types.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'

export async function analyzeDpmProfileRuntime(
  input: DpmGatewayProfileAnalysisInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileAnalysisResult>> {
  return createDpmGatewayRuntimeResponse({
    operationId: 'analyzeDpmProfile',
    statusCode: 200,
    command: 'analyze-profile',
    result: {
      analysisReport: createDpmProfileAnalysisReport(input),
    },
  })
}
