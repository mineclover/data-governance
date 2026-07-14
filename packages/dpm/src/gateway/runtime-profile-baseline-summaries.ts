import {
  copyDpmProfileBaselineSummaries,
} from '../storage/profile-baseline-repository.js'
import { createDpmGatewayRuntimeResponse } from './runtime-response.js'
import type { DpmGatewayRuntimeResponse } from './runtime-response-types.js'
import type {
  DpmGatewayProfileBaselineSummaryListInput,
  DpmGatewayProfileBaselineSummaryListResult,
} from './runtime-profile-types.js'

export async function listDpmProfileBaselineSummariesRuntime(
  input: DpmGatewayProfileBaselineSummaryListInput,
): Promise<DpmGatewayRuntimeResponse<DpmGatewayProfileBaselineSummaryListResult>> {
  assertProfileBaselineSummaryListLimit(input.limit)

  const baselineSummaries = await input.profileBaselineRepository.listProfileBaselineSummaries({
    datasetId: input.datasetId,
    profileId: input.profileId,
    ...(input.limit !== undefined ? { limit: input.limit } : {}),
  })

  return createDpmGatewayRuntimeResponse({
    operationId: 'listDpmProfileBaselineSummaries',
    statusCode: 200,
    command: 'list-profile-baseline-summaries',
    result: {
      baselineSummaries: copyDpmProfileBaselineSummaries(baselineSummaries),
    },
  })
}

function assertProfileBaselineSummaryListLimit(limit: number | undefined): void {
  if (limit === undefined) return
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('profile baseline summary list limit must be a positive integer')
  }
}
