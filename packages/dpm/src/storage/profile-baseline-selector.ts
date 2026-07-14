import type { DpmProfileArtifact } from '../profile/profile-artifact-types.js'
import { copyDpmProfileBaselineRow } from './profile-baseline-row-builder.js'
import type { DpmProfileBaselineRow } from './profile-baseline-row-types.js'
import { copyDpmProfileBaselineSummary } from './profile-baseline-summary.js'
import type { DpmProfileBaselineSummary } from './profile-baseline-summary-types.js'

export type DpmPreviousProfileBaselineSelectionInput = {
  profileArtifact: DpmProfileArtifact
  baselines: readonly DpmProfileBaselineRow[]
  limit?: number
  includeCurrentProfileVersionHash?: boolean
}

export type DpmPreviousProfileBaselineSummarySelectionInput = {
  profileArtifact: DpmProfileArtifact
  baselineSummaries: readonly DpmProfileBaselineSummary[]
  limit?: number
  includeCurrentProfileVersionHash?: boolean
}

export function selectDpmPreviousProfileBaseline(
  input: DpmPreviousProfileBaselineSelectionInput,
): DpmProfileBaselineRow | undefined {
  const candidates = input.baselines
    .filter(baseline => isSameProfileHistory(baseline, input.profileArtifact))
    .filter(baseline => isPreviousProfileVersionHashCandidate(
      baseline,
      input.profileArtifact,
      input.includeCurrentProfileVersionHash,
    ))
    .sort(compareProfileBaselinesForLatestPrevious)
  const selected = selectFirstCandidate(candidates, input.limit)

  return selected ? copyDpmProfileBaselineRow(selected) : undefined
}

export function selectDpmPreviousProfileBaselineSummary(
  input: DpmPreviousProfileBaselineSummarySelectionInput,
): DpmProfileBaselineSummary | undefined {
  const candidates = input.baselineSummaries
    .filter(baseline => isSameProfileHistory(baseline, input.profileArtifact))
    .filter(baseline => isPreviousProfileVersionHashCandidate(
      baseline,
      input.profileArtifact,
      input.includeCurrentProfileVersionHash,
    ))
    .sort(compareProfileBaselinesForLatestPrevious)
  const selected = selectFirstCandidate(candidates, input.limit)

  return selected ? copyDpmProfileBaselineSummary(selected) : undefined
}

type DpmProfileBaselineSelectionCandidate = Pick<
  DpmProfileBaselineRow,
  'baselineRef' | 'datasetId' | 'profileId' | 'profileVersion' | 'profileVersionHash' | 'storedAt'
>

function isSameProfileHistory(
  baseline: DpmProfileBaselineSelectionCandidate,
  profileArtifact: DpmProfileArtifact,
): boolean {
  return baseline.datasetId === profileArtifact.datasetId
    && baseline.profileId === profileArtifact.profileId
}

function isPreviousProfileVersionHashCandidate(
  baseline: DpmProfileBaselineSelectionCandidate,
  profileArtifact: DpmProfileArtifact,
  includeCurrentProfileVersionHash: boolean | undefined,
): boolean {
  return Boolean(includeCurrentProfileVersionHash)
    || baseline.profileVersionHash !== profileArtifact.freshness.versionHash
}

function compareProfileBaselinesForLatestPrevious(
  left: DpmProfileBaselineSelectionCandidate,
  right: DpmProfileBaselineSelectionCandidate,
): number {
  return compareDescending(left.storedAt ?? '', right.storedAt ?? '')
    || compareDescending(left.profileVersion, right.profileVersion)
    || compareDescending(left.profileVersionHash, right.profileVersionHash)
    || left.baselineRef.localeCompare(right.baselineRef)
}

function selectFirstCandidate<TCandidate>(
  candidates: readonly TCandidate[],
  limit: number | undefined,
): TCandidate | undefined {
  return limit === undefined
    ? candidates[0]
    : candidates.slice(0, limit)[0]
}

function compareDescending(left: string, right: string): number {
  return right.localeCompare(left)
}
