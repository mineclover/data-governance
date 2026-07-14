import type { DpmGatewayProfileAnalysisInput } from './runtime-profile-types.js'
import {
  summarizeDpmProfileBaselineRow,
} from '../storage/profile-baseline-repository.js'
import type { DpmProfileArtifact } from '../profile/types.js'
import type { DpmProfileBaselineSummary } from '../storage/profile-baseline-repository.js'
import type {
  DpmGatewayProfileAnalysisBaselineResolver,
  DpmGatewayProfileAnalysisResolvedRequest,
  DpmGatewayProfileAnalysisRequest,
} from './runtime-profile-analysis-request-types.js'

export type {
  DpmGatewayProfileAnalysisBaselineResolver,
  DpmGatewayProfileAnalysisResolvedRequest,
  DpmGatewayProfileAnalysisRequest,
  DpmGatewayProfileBaselineRef,
} from './runtime-profile-analysis-request-types.js'

export async function resolveDpmGatewayProfileAnalysisRuntimeInput(input: {
  request: DpmGatewayProfileAnalysisRequest
  profileBaselineRepository?: DpmGatewayProfileAnalysisBaselineResolver
}): Promise<DpmGatewayProfileAnalysisInput> {
  const resolved = await resolveDpmGatewayProfileAnalysisRequest(input)

  return resolved.runtimeInput
}

export async function resolveDpmGatewayProfileAnalysisRequest(input: {
  request: DpmGatewayProfileAnalysisRequest
  profileBaselineRepository?: DpmGatewayProfileAnalysisBaselineResolver
}): Promise<DpmGatewayProfileAnalysisResolvedRequest> {
  const previousProfile = await resolvePreviousProfileArtifact(input)

  return {
    runtimeInput: {
      profileArtifact: input.request.profileArtifact,
      ...(previousProfile.previousProfileArtifact
        ? { previousProfileArtifact: previousProfile.previousProfileArtifact }
        : {}),
      ...(input.request.policy ? { policy: input.request.policy } : {}),
      ...(input.request.reportId ? { reportId: input.request.reportId } : {}),
      ...(input.request.analyzedAt ? { analyzedAt: input.request.analyzedAt } : {}),
    },
    ...(previousProfile.previousProfileBaselineSummary
      ? { previousProfileBaselineSummary: previousProfile.previousProfileBaselineSummary }
      : {}),
  }
}

async function resolvePreviousProfileArtifact(input: {
  request: DpmGatewayProfileAnalysisRequest
  profileBaselineRepository?: DpmGatewayProfileAnalysisBaselineResolver
}): Promise<{
  previousProfileArtifact?: DpmProfileArtifact
  previousProfileBaselineSummary?: DpmProfileBaselineSummary
}> {
  const { previousProfileArtifact, previousProfileBaseline } = input.request
  if (!previousProfileBaseline) {
    return previousProfileArtifact ? { previousProfileArtifact } : {}
  }
  if (previousProfileArtifact) {
    throw new Error('profile analysis request must provide either previousProfileArtifact or previousProfileBaseline, not both')
  }
  if (!input.profileBaselineRepository) {
    throw new Error('profile baseline repository is required to resolve previousProfileBaseline')
  }
  if (previousProfileBaseline.baselineRef && previousProfileBaseline.selectionStrategy) {
    throw new Error('profile analysis previousProfileBaseline must provide either baselineRef or selectionStrategy, not both')
  }
  if (!previousProfileBaseline.baselineRef && !previousProfileBaseline.selectionStrategy) {
    throw new Error('profile analysis previousProfileBaseline must provide baselineRef or selectionStrategy')
  }
  if (previousProfileBaseline.limit !== undefined && !previousProfileBaseline.selectionStrategy) {
    throw new Error('profile analysis previousProfileBaseline limit requires selectionStrategy')
  }
  assertProfileBaselineSelectionLimit(previousProfileBaseline.limit)
  if (previousProfileBaseline.selectionStrategy) {
    return resolveSelectedPreviousProfileArtifact(input)
  }
  const baselineRef = previousProfileBaseline.baselineRef
  if (!baselineRef) {
    throw new Error('profile analysis previousProfileBaseline must provide baselineRef or selectionStrategy')
  }

  const row = await input.profileBaselineRepository.getProfileBaseline({
    baselineRef,
  })
  if (!row) {
    throw new Error(`profile baseline not found: ${baselineRef}`)
  }

  return {
    previousProfileArtifact: row.profileArtifact,
    previousProfileBaselineSummary: summarizeDpmProfileBaselineRow(row),
  }
}

async function resolveSelectedPreviousProfileArtifact(input: {
  request: DpmGatewayProfileAnalysisRequest
  profileBaselineRepository?: DpmGatewayProfileAnalysisBaselineResolver
}): Promise<{
  previousProfileArtifact: DpmProfileArtifact
  previousProfileBaselineSummary: DpmProfileBaselineSummary
}> {
  const previousProfileBaseline = input.request.previousProfileBaseline
  if (previousProfileBaseline?.selectionStrategy !== 'latest_previous') {
    throw new Error(`unsupported profile baseline selection strategy: ${previousProfileBaseline?.selectionStrategy}`)
  }
  if (!input.profileBaselineRepository?.selectPreviousProfileBaseline) {
    throw new Error('profile baseline selector is required to resolve previousProfileBaseline selectionStrategy')
  }

  const row = await input.profileBaselineRepository.selectPreviousProfileBaseline({
    profileArtifact: input.request.profileArtifact,
    ...(previousProfileBaseline.limit !== undefined ? { limit: previousProfileBaseline.limit } : {}),
  })
  if (!row) {
    throw new Error('profile baseline selection did not find a previous baseline: latest_previous')
  }

  return {
    previousProfileArtifact: row.profileArtifact,
    previousProfileBaselineSummary: summarizeDpmProfileBaselineRow(row),
  }
}

function assertProfileBaselineSelectionLimit(limit: number | undefined): void {
  if (limit === undefined) return
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('profile analysis previousProfileBaseline limit must be a positive integer')
  }
}
