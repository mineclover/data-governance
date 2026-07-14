import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import type { ManifestRelationship } from './relationship-types.js'
import { toStringArray } from './relationship-utils.js'

export function validateRelationshipShapeGates(input: {
  relationship: ManifestRelationship
  pointer: string
}): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const name = input.relationship.name ?? ''
  const parentColumns = toStringArray(input.relationship.parent?.columns)
  const childColumns = toStringArray(input.relationship.child?.columns)

  if (input.relationship.type === 'polymorphic' && !input.relationship.condition_sql && !input.relationship.condition?.conditionSql) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL007',
      message: `Polymorphic relationship ${name} requires condition_sql.`,
      sourcePointer: `${input.pointer}/condition_sql`,
    }))
  }
  if (input.relationship.type === 'temporal' && !input.relationship.temporal_condition && !input.relationship.condition?.temporalCondition) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL008',
      message: `Temporal relationship ${name} requires temporal_condition.`,
      sourcePointer: `${input.pointer}/temporal_condition`,
    }))
  }
  if (parentColumns.length > 1 && childColumns.length > 1 && !input.relationship.canonical_key && !input.relationship.canonicalKey) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL009',
      message: `Composite relationship ${name} requires an explicit canonical key strategy.`,
      sourcePointer: `${input.pointer}/canonical_key`,
    }))
  }

  return diagnostics
}
