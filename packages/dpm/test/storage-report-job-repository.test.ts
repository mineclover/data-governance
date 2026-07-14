import { describe, expect, it, vi } from 'vitest'

import {
  compileDpmPlan,
  createDpmJobRepository,
  type DpmJobRow,
} from '../src/index.js'
import {
  createCompletedStorageJobInput,
  createStorageReportCompileInput,
  expectStorageReportPayloadExcludesUnsafeFragments,
} from './support/storage-report-fixtures.js'

describe('DPM job repository', () => {
  it('persists compile job metadata, diagnostics, freshness, and report references without unsafe payloads', async () => {
    const compiled = compileDpmPlan(createStorageReportCompileInput())
    if (!compiled.ok) throw new Error('expected compile success')

    const upsertJob = vi.fn(async (_row: DpmJobRow) => undefined)
    const repository = createDpmJobRepository({
      upsertJob,
      getJob: async () => undefined,
    })

    const row = await repository.saveJob(
      createCompletedStorageJobInput(compiled),
    )

    expect(upsertJob).toHaveBeenCalledWith(row)
    expect(row).toMatchObject({
      kind: 'dpm.job.v1',
      jobId: 'job_compile_001',
      operation: 'compile',
      status: 'completed',
      datasetId: 'commerce_ai',
      manifestId: compiled.plan.manifestId,
      planIdentity: compiled.plan.identity,
      validationReportRef: 'dpm-report:job_compile_001',
      freshness: compiled.plan.freshness,
      diagnostics: compiled.validation.diagnostics,
    })
    expectStorageReportPayloadExcludesUnsafeFragments(row)
  })
})
