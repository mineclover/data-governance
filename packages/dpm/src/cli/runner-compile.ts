import { compileDpmPlan } from '../compiler/compile-orchestrator.js'
import type { DpmCliInputs } from './input-types.js'
import { createDpmCliResult } from './result.js'
import type { DpmCliResult } from './types.js'

export function runDpmCliCompileCommand(inputs: DpmCliInputs): DpmCliResult {
  const result = compileDpmPlan({
    manifest: inputs.manifest,
    catalog: inputs.catalog,
    registry: inputs.registry,
    phase: 'compile',
  })
  return createDpmCliResult('compile', result.ok ? 0 : 1, result, inputs.format)
}
