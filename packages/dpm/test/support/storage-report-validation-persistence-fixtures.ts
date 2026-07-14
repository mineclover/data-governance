import type {
  DpmCompileSuccess,
  DpmDryRunReport,
} from '../../src/index.js'
import {
  STORAGE_REPORT_UNSAFE_CUSTOMER_NO,
  STORAGE_REPORT_UNSAFE_SOURCE_PASSWORD,
  type StorageReportUnsafeValidationReportInput,
} from './storage-report-unsafe-fixtures.js'

export function createCompletedStorageValidationReportInput({
  compiled,
  dryRun,
}: {
  compiled: DpmCompileSuccess
  dryRun: DpmDryRunReport
}): StorageReportUnsafeValidationReportInput {
  return {
    jobId: 'job_dry_run_001',
    status: 'completed',
    validationReportRef: 'dpm-report:job_dry_run_001',
    diagnostics: compiled.validation.diagnostics,
    planIdentity: compiled.plan.identity,
    freshness: compiled.plan.freshness,
    impact: dryRun.impact,
    categories: dryRun.categories,
    createdAt: '2026-07-01T00:00:02.000Z',
    rawSamples: {
      customer_no: STORAGE_REPORT_UNSAFE_CUSTOMER_NO,
    },
    sourceCredentials: {
      password: STORAGE_REPORT_UNSAFE_SOURCE_PASSWORD,
    },
  }
}
