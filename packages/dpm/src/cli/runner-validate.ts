import { validateDpmManifest } from '../validator/manifest-validator.js'
import type { DpmCliInputs } from './input-types.js'
import { createDpmCliResult } from './result.js'
import type { DpmCliResult } from './types.js'

export function runDpmCliValidateCommand(inputs: DpmCliInputs): DpmCliResult {
  const result = validateDpmManifest({
    manifest: inputs.manifest,
    catalog: inputs.catalog,
    registry: inputs.registry,
    phase: 'validate',
  })
  return createDpmCliResult(
    'validate',
    result.summary.errors > 0 ? 1 : 0,
    result,
    inputs.format,
  )
}
