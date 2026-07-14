import {
  createDpmJobRepository,
  createDpmReportRepository,
  type DpmJobRepository,
  type DpmJobRow,
  type DpmReportRepository,
  type DpmStoredValidationReport,
} from '../../src/index.js'

export type StorageDemoPersistenceRepositories = {
  jobRows: Map<string, DpmJobRow>
  reportRows: Map<string, DpmStoredValidationReport>
  jobRepository: DpmJobRepository
  reportRepository: DpmReportRepository
}

export function createStorageDemoPersistenceRepositories(): StorageDemoPersistenceRepositories {
  const jobRows = new Map<string, DpmJobRow>()
  const reportRows = new Map<string, DpmStoredValidationReport>()

  return {
    jobRows,
    reportRows,
    jobRepository: createDpmJobRepository({
      upsertJob: async row => {
        jobRows.set(row.jobId, row)
      },
      getJob: async request => jobRows.get(request.jobId),
    }),
    reportRepository: createDpmReportRepository({
      upsertReport: async row => {
        reportRows.set(row.jobId, row)
      },
      getValidationReport: async request => reportRows.get(request.jobId),
    }),
  }
}

