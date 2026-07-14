import {
  copyValidationReportDiagnostics,
} from './report-row-diagnostics.js'
import type { DpmGatewayJobReport } from './report-gateway-types.js'
import type { DpmValidationReportRequest } from './report-request-types.js'
import type { DpmStoredValidationReport } from './report-row-types.js'

export function validationReportToGatewayJobReport(
  request: DpmValidationReportRequest,
  row: DpmStoredValidationReport,
): DpmGatewayJobReport {
  if (row.jobId !== request.jobId) {
    throw new Error(`Validation report row ${row.jobId} does not match requested job ${request.jobId}`)
  }

  return {
    jobId: row.jobId,
    status: row.status,
    validationReportRef: row.validationReportRef,
    diagnostics: copyValidationReportDiagnostics(row.diagnostics),
  }
}
