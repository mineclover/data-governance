import {
  createRelationshipDiscoveryReport,
} from '../discovery/report-builder.js'
import type {
  DpmGatewayCandidateImportInput,
  DpmGatewayCandidateImportResult,
} from './runtime-relationship-types.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'

export async function importDpmRelationshipCandidatesRuntime(
  input: DpmGatewayCandidateImportInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayCandidateImportResult>> {
  const report = createRelationshipDiscoveryReport({
    datasetId: input.datasetId,
    ...(input.generatedAt ? { generatedAt: input.generatedAt } : {}),
    ...(input.thresholds ? { thresholds: input.thresholds } : {}),
    candidates: input.candidates,
    ...(input.exclusions ? { exclusions: input.exclusions } : {}),
  })

  return createDpmGatewayRuntimeResponse({
    operationId: 'importDpmRelationshipCandidates',
    statusCode: 200,
    command: 'import-relationship-candidates',
    result: {
      imported: report.summary.reviewCount,
      rejected: report.summary.rejectCount,
      report,
    },
  })
}
