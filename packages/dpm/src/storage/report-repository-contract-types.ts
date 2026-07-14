import type {
  DpmValidationReportRequest,
  DpmValidationReportSaveInput,
} from './report-request-types.js'
import type { DpmGatewayJobReport } from './report-gateway-types.js'
import type { DpmStoredValidationReport } from './report-row-types.js'

export type DpmValidationReportStorage = {
  upsertReport(row: DpmStoredValidationReport): Promise<void> | void
  getValidationReport(
    request: DpmValidationReportRequest,
  ): Promise<DpmStoredValidationReport | undefined> | DpmStoredValidationReport | undefined
}

export type DpmReportRepository = {
  saveReport(input: DpmValidationReportSaveInput): Promise<DpmStoredValidationReport>
  getJobReport(request: DpmValidationReportRequest): Promise<DpmGatewayJobReport | undefined>
}
