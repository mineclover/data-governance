import { describe, expect, it } from 'vitest'

import { validateDpmManifest } from '../src/index.js'
import {
  createAmbiguousRegistryApprovalInput,
  expectedAmbiguousRegistryApprovalDiagnosticCodes,
} from './support/validator-relationship-registry-fixtures.js'

describe('DPM relationship validator registry approval gates', () => {
  it('flags ambiguous approved registry matches deterministically', () => {
    const result = validateDpmManifest(createAmbiguousRegistryApprovalInput())

    expect(result.valid).toBe(false)
    expect(result.diagnostics.map(diagnostic => diagnostic.code)).toEqual([
      ...expectedAmbiguousRegistryApprovalDiagnosticCodes,
    ])
  })
})
