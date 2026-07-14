import type { DpmValidationInput } from '../../src/index.js'
import {
  applyUnsafeRelationshipDiagnosticManifestMutations,
} from './validator-relationship-diagnostic-manifest.js'
import { createValidationInput } from './validator-fixtures.js'

export function createUnsafeRelationshipDiagnosticInput(): DpmValidationInput {
  const input = createValidationInput()
  const manifest = structuredClone(input.manifest) as Record<string, any>
  applyUnsafeRelationshipDiagnosticManifestMutations(manifest)

  return {
    ...input,
    manifest,
    phase: 'compile',
  }
}
