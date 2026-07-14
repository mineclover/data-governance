import { describe, expect, it } from 'vitest'

import { validateDpmManifest } from '../src/index.js'
import {
  createValidationInput,
  expectedValidManifestDiagnosticCodes,
  expectedValidManifestDiagnostics,
  expectedValidManifestDiagnosticSummary,
} from './support/validator-fixtures.js'

describe('DPM semantic validator', () => {
  it('validates manifest, catalog snapshot, and registry snapshot without source DB access', () => {
    const result = validateDpmManifest(createValidationInput())

    expect(result.valid).toBe(true)
    expect(result.summary).toEqual(expectedValidManifestDiagnosticSummary)
    expect(result.diagnostics.map(diagnostic => diagnostic.code)).toEqual([
      ...expectedValidManifestDiagnosticCodes,
    ])
    expect(result.diagnostics).toMatchObject([...expectedValidManifestDiagnostics])
  })
})
