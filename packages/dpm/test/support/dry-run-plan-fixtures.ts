import {
  compileDpmPlan,
  createDpmDryRunReport,
  type DpmCompiledPlan,
  type DpmDryRunReport,
} from '../../src/index.js'
import { createCompileInput } from './compiler-input-fixtures.js'
import {
  DPM_DRY_RUN_ESTIMATED_ROWS,
  DPM_DRY_RUN_SAMPLE_VALUES,
} from './dry-run-input-fixtures.js'

export function createCompiledDryRunFixturePlan(): DpmCompiledPlan {
  const input = createCompileInput()
  const manifest = structuredClone(input.manifest) as Record<string, any>
  manifest.catalog.version_hash = input.catalog.freshness.versionHash

  const compiled = compileDpmPlan({
    ...input,
    manifest,
  })
  if (!compiled.ok) throw new Error('expected compile success')

  return compiled.plan
}

export function createDryRunReportForPlan(
  plan: DpmCompiledPlan,
): DpmDryRunReport {
  return createDpmDryRunReport({
    plan,
    estimatedRows: DPM_DRY_RUN_ESTIMATED_ROWS,
    sampleValues: DPM_DRY_RUN_SAMPLE_VALUES,
  })
}
