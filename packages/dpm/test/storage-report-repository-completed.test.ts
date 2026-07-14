import { describe, expect, it, vi } from 'vitest'

import {
  compileDpmPlan,
  createDpmReportRepository,
  type DpmStoredValidationReport,
} from '../src/index.js'
import {
  createCompletedStorageValidationReportInput,
  createStorageReportCompileInput,
  createStorageReportDryRunReport,
  expectStorageReportPayloadExcludesUnsafeFragments,
} from './support/storage-report-fixtures.js'

describe('DPM validation report repository — completed reports', () => {
  it('stores dry-run report summaries without raw sensitive samples', async () => {
    const compiled = compileDpmPlan(createStorageReportCompileInput())
    if (!compiled.ok) throw new Error('expected compile success')
    const dryRun = createStorageReportDryRunReport(compiled.plan)
    const upsertReport = vi.fn(async (_row: DpmStoredValidationReport) => undefined)
    const repository = createDpmReportRepository({
      upsertReport,
      getValidationReport: async () => undefined,
    })

    const report = await repository.saveReport(
      createCompletedStorageValidationReportInput({ compiled, dryRun }),
    )

    expect(upsertReport).toHaveBeenCalledWith(report)
    expect(report).toMatchObject({
      kind: 'dpm.validation-report.v1',
      jobId: 'job_dry_run_001',
      status: 'completed',
      validationReportRef: 'dpm-report:job_dry_run_001',
      planIdentity: compiled.plan.identity,
      freshness: compiled.plan.freshness,
      impact: dryRun.impact,
      categories: dryRun.categories,
      diagnostics: compiled.validation.diagnostics,
    })
    expectStorageReportPayloadExcludesUnsafeFragments(report)
  })
})
