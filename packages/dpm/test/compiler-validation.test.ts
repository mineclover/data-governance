import { describe, expect, it } from 'vitest'

import { compileDpmPlan } from '../src/index.js'
import { createCompileInput } from './support/compiler-input-fixtures.js'
import {
  compilerValidationBlockingCases,
} from './support/compiler-validation-fixtures.js'

describe('DPM compiler validation gate', () => {
  it('refuses validator-blocking manifest cases without producing a plan', () => {
    for (const { label, expectedDiagnosticCode, mutateManifest } of compilerValidationBlockingCases) {
      const input = createCompileInput()
      const manifest = structuredClone(input.manifest) as Record<string, any>
      mutateManifest(manifest)

      const result = compileDpmPlan({
        ...input,
        manifest,
      })

      expect(result.ok, label).toBe(false)
      if (result.ok) throw new Error(`expected compile failure for ${label}`)
      expect(result.diagnostics.map(diagnostic => diagnostic.code), label)
        .toContain(expectedDiagnosticCode)
      expect('plan' in result, label).toBe(false)
    }
  })
})
