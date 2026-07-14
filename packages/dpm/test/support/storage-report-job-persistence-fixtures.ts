import type {
  DpmCompileSuccess,
} from '../../src/index.js'
import {
  STORAGE_REPORT_UNSAFE_CUSTOMER_NO,
  STORAGE_REPORT_UNSAFE_SOURCE_PASSWORD,
  STORAGE_REPORT_UNSAFE_TOKEN_LOOKUP_KEY,
  STORAGE_REPORT_UNSAFE_VAULT_MATERIAL,
  type StorageReportUnsafeJobInput,
} from './storage-report-unsafe-fixtures.js'

export function createCompletedStorageJobInput(
  compiled: DpmCompileSuccess,
): StorageReportUnsafeJobInput {
  return {
    jobId: 'job_compile_001',
    operation: 'compile',
    status: 'completed',
    datasetId: compiled.plan.datasetId,
    manifestId: compiled.plan.manifestId,
    planIdentity: compiled.plan.identity,
    freshness: compiled.plan.freshness,
    diagnostics: compiled.validation.diagnostics,
    validationReportRef: 'dpm-report:job_compile_001',
    createdAt: '2026-07-01T00:00:00.000Z',
    completedAt: '2026-07-01T00:00:01.000Z',
    sourceDbPassword: STORAGE_REPORT_UNSAFE_SOURCE_PASSWORD,
    vaultMaterial: STORAGE_REPORT_UNSAFE_VAULT_MATERIAL,
    tokenReverseLookup: {
      [STORAGE_REPORT_UNSAFE_TOKEN_LOOKUP_KEY]: STORAGE_REPORT_UNSAFE_CUSTOMER_NO,
    },
    rawSamples: {
      customer_no: STORAGE_REPORT_UNSAFE_CUSTOMER_NO,
    },
  }
}
