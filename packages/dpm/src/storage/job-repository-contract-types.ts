import type {
  DpmJobRequest,
  DpmJobSaveInput,
} from './job-request-types.js'
import type { DpmJobRow } from './job-row-types.js'

export type DpmJobStorage = {
  upsertJob(row: DpmJobRow): Promise<void> | void
  getJob(request: DpmJobRequest): Promise<DpmJobRow | undefined> | DpmJobRow | undefined
}

export type DpmJobRepository = {
  saveJob(input: DpmJobSaveInput): Promise<DpmJobRow>
  getJob(request: DpmJobRequest): Promise<DpmJobRow | undefined>
}
