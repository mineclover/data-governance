import type {
  DpmProfileBaselineRepository,
  DpmProfileBaselineStorage,
} from './profile-baseline-repository-contract-types.js'
import {
  copyDpmProfileBaselineRow,
  createDpmProfileBaselineRow,
} from './profile-baseline-row-builder.js'
import {
  selectDpmPreviousProfileBaseline,
  selectDpmPreviousProfileBaselineSummary,
} from './profile-baseline-selector.js'
import {
  copyDpmProfileBaselineSummaries,
  summarizeDpmProfileBaselineRows,
} from './profile-baseline-summary.js'

export function createDpmProfileBaselineRepository(
  storage: DpmProfileBaselineStorage,
): DpmProfileBaselineRepository {
  return {
    async saveProfileBaseline(input) {
      const row = createDpmProfileBaselineRow(input)
      await storage.upsertProfileBaseline(copyDpmProfileBaselineRow(row))
      return row
    },
    async getProfileBaseline(request) {
      const row = await storage.getProfileBaseline(request)
      return row ? copyDpmProfileBaselineRow(row) : undefined
    },
    async listProfileBaselines(request) {
      const rows = await storage.listProfileBaselines(request)
      return rows.map(copyDpmProfileBaselineRow)
    },
    async listProfileBaselineSummaries(request) {
      if (storage.listProfileBaselineSummaries) {
        const summaries = await storage.listProfileBaselineSummaries(request)
        return copyDpmProfileBaselineSummaries(summaries)
      }
      const rows = await storage.listProfileBaselines(request)
      return summarizeDpmProfileBaselineRows(rows)
    },
    async selectPreviousProfileBaseline(request) {
      if (storage.listProfileBaselineSummaries) {
        const summaries = copyDpmProfileBaselineSummaries(await storage.listProfileBaselineSummaries({
          datasetId: request.profileArtifact.datasetId,
          profileId: request.profileArtifact.profileId,
        }))
        const selectedSummary = selectDpmPreviousProfileBaselineSummary({
          profileArtifact: request.profileArtifact,
          baselineSummaries: summaries,
          ...(request.limit !== undefined ? { limit: request.limit } : {}),
          ...(request.includeCurrentProfileVersionHash !== undefined
            ? { includeCurrentProfileVersionHash: request.includeCurrentProfileVersionHash }
            : {}),
        })
        if (!selectedSummary) return undefined

        const row = await storage.getProfileBaseline({ baselineRef: selectedSummary.baselineRef })
        return row ? copyDpmProfileBaselineRow(row) : undefined
      }

      const rows = await storage.listProfileBaselines({
        datasetId: request.profileArtifact.datasetId,
        profileId: request.profileArtifact.profileId,
      })
      return selectDpmPreviousProfileBaseline({
        profileArtifact: request.profileArtifact,
        baselines: rows,
        ...(request.limit !== undefined ? { limit: request.limit } : {}),
        ...(request.includeCurrentProfileVersionHash !== undefined
          ? { includeCurrentProfileVersionHash: request.includeCurrentProfileVersionHash }
          : {}),
      })
    },
  }
}
