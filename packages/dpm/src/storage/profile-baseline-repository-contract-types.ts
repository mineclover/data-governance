import type {
  DpmProfileBaselineListRequest,
  DpmProfileBaselineRequest,
  DpmProfileBaselineSelectionRequest,
  DpmProfileBaselineSaveInput,
} from './profile-baseline-request-types.js'
import type { DpmProfileBaselineRow } from './profile-baseline-row-types.js'
import type { DpmProfileBaselineSummary } from './profile-baseline-summary-types.js'

export type DpmProfileBaselineStorage = {
  upsertProfileBaseline(row: DpmProfileBaselineRow): Promise<void> | void
  getProfileBaseline(
    request: DpmProfileBaselineRequest,
  ): Promise<DpmProfileBaselineRow | undefined> | DpmProfileBaselineRow | undefined
  listProfileBaselines(
    request: DpmProfileBaselineListRequest,
  ): Promise<readonly DpmProfileBaselineRow[]> | readonly DpmProfileBaselineRow[]
  listProfileBaselineSummaries?(
    request: DpmProfileBaselineListRequest,
  ): Promise<readonly DpmProfileBaselineSummary[]> | readonly DpmProfileBaselineSummary[]
}

export type DpmProfileBaselineRepository = {
  saveProfileBaseline(input: DpmProfileBaselineSaveInput): Promise<DpmProfileBaselineRow>
  getProfileBaseline(request: DpmProfileBaselineRequest): Promise<DpmProfileBaselineRow | undefined>
  listProfileBaselines(request: DpmProfileBaselineListRequest): Promise<DpmProfileBaselineRow[]>
  listProfileBaselineSummaries(request: DpmProfileBaselineListRequest): Promise<DpmProfileBaselineSummary[]>
  selectPreviousProfileBaseline(
    request: DpmProfileBaselineSelectionRequest,
  ): Promise<DpmProfileBaselineRow | undefined>
}
