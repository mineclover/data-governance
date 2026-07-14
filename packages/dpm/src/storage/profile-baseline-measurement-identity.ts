import { createHash } from 'node:crypto'

import type { DpmProfileAnalysisReport } from '../profile/analysis-report-types.js'
import type { DpmProfileArtifact } from '../profile/profile-artifact-types.js'

export type DpmProfileBaselineMeasurementIdentityInput = {
  profileArtifact: DpmProfileArtifact
  analysisReport?: DpmProfileAnalysisReport
  measurementId?: string
  measuredAt?: string
  measurementRunHash?: string
}

export function createDpmProfileBaselineMeasurementId(
  input: DpmProfileBaselineMeasurementIdentityInput,
): string | undefined {
  if (input.measurementId) return input.measurementId
  if (!input.measuredAt && !input.measurementRunHash) return undefined

  return `sha256:${createHash('sha256')
    .update(stableStringify({
      datasetId: input.profileArtifact.datasetId,
      profileId: input.profileArtifact.profileId,
      profileVersion: input.profileArtifact.profileVersion,
      profileVersionHash: input.profileArtifact.freshness.versionHash,
      ...(input.analysisReport ? { reportHash: input.analysisReport.freshness.reportHash } : {}),
      ...(input.measuredAt ? { measuredAt: input.measuredAt } : {}),
      ...(input.measurementRunHash ? { measurementRunHash: input.measurementRunHash } : {}),
    }))
    .digest('hex')}`
}

export function renderDpmProfileBaselineRef(input: {
  profileArtifact: DpmProfileArtifact
  measurementId?: string
}): string {
  return [
    'dpm-profile-baseline',
    input.profileArtifact.datasetId,
    input.profileArtifact.profileId,
    input.profileArtifact.freshness.versionHash,
    ...(input.measurementId ? [input.measurementId] : []),
  ].join(':')
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value))
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!value || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(record).sort()) {
    const next = record[key]
    if (next !== undefined) sorted[key] = sortValue(next)
  }
  return sorted
}
