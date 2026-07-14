import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import type { DpmValidationPhase } from './validation-types.js'
import {
  asArray,
  asRecord,
  asString,
} from './value-utils.js'

export function validateSafetyManifestGates(input: {
  manifest: Record<string, unknown>
  phase: DpmValidationPhase
}): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []

  if (!hasRelationshipDriftGate(asArray(input.manifest.quality_gates))) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'warning',
      code: 'SAF007',
      message: 'Manifest is missing a relationship drift quality gate.',
      sourcePointer: '/quality_gates',
    }))
  }

  const vault = asRecord(input.manifest.vault)
  if (input.phase !== 'runtime' && asString(vault.mode) === 'runtime') {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'SAF011',
      message: 'runtime vault operations are only allowed in runtime phase.',
      sourcePointer: '/vault/mode',
    }))
  }

  return diagnostics
}

function hasRelationshipDriftGate(qualityGates: readonly unknown[]): boolean {
  return qualityGates.some(gate => {
    const record = asRecord(gate)
    return asString(record.name) === 'relationship_drift' || asString(record.type) === 'relationship_drift'
  })
}
