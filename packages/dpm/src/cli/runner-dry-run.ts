import { compileDpmPlan } from '../compiler/compile-orchestrator.js'
import { createDpmDryRunReport } from '../dry-run/report-builder.js'
import type { DpmCliInputs } from './input-types.js'
import { createDpmCliJsonResult } from './result.js'
import type { DpmCliResult } from './types.js'

export function runDpmCliDryRunCommand(inputs: DpmCliInputs): DpmCliResult {
  const compiled = compileDpmPlan({
    manifest: inputs.manifest,
    catalog: inputs.catalog,
    registry: inputs.registry,
    phase: 'dry_run',
  })
  if (!compiled.ok) {
    return createDpmCliJsonResult('dry-run', 1, compiled)
  }

  return createDpmCliJsonResult('dry-run', 0, createDpmDryRunReport({
    plan: compiled.plan,
    ...(inputs.estimatedRows ? { estimatedRows: inputs.estimatedRows } : {}),
  }))
}
