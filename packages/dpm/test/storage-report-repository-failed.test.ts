import { describe, expect, it } from 'vitest'

import {
  compileDpmPlan,
  createDpmReportRepository,
} from '../src/index.js'
import {
  createStorageReportCompileInput,
} from './support/storage-report-fixtures.js'

describe('DPM validation report repository — failed reports', () => {
  it('preserves deterministic diagnostics for failed validation reports', async () => {
    const input = createStorageReportCompileInput()
    const manifest = structuredClone(input.manifest) as Record<string, any>
    manifest.columns[0].transform = { type: 'keep' }
    const compiled = compileDpmPlan({
      ...input,
      manifest,
    })
    if (compiled.ok) throw new Error('expected compile failure')

    const repository = createDpmReportRepository({
      upsertReport: async () => undefined,
      getValidationReport: async () => undefined,
    })

    const report = await repository.saveReport({
      jobId: 'job_failed_001',
      status: 'failed',
      diagnostics: compiled.diagnostics,
      createdAt: '2026-07-01T00:00:03.000Z',
    })

    expect(report.validationReportRef).toBe('dpm-report:job_failed_001')
    expect(report.diagnostics).toEqual(compiled.diagnostics)
    expect(report.diagnostics.map(diagnostic => diagnostic.code)).toContain('SAF001')
  })
})
