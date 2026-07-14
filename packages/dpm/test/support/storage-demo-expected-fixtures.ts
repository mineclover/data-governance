import type {
  DpmDiagnostic,
  DpmGatewayJobReport,
  DpmValidationSummary,
} from '../../src/index.js'
import {
  storageDemoJobId,
  storageDemoValidationReportRef,
} from './storage-demo-constant-fixtures.js'

export const expectedStorageDemoValidationSummary = {
  errors: 0,
  warnings: 0,
  infos: 0,
} as const satisfies DpmValidationSummary

export const expectedStorageDemoDryRunImpact = {
  namespaces: 1,
  relationships: 1,
  columns: 2,
  piiColumns: 2,
  estimatedRows: 7000,
} as const

export function createExpectedStorageDemoJobReport(
  diagnostics: readonly DpmDiagnostic[],
): DpmGatewayJobReport {
  return {
    jobId: storageDemoJobId,
    status: 'completed',
    validationReportRef: storageDemoValidationReportRef,
    diagnostics: [...diagnostics],
  }
}
