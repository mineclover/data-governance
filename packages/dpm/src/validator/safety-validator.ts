import type { DpmDiagnostic } from './diagnostic-types.js'
import { validateSafetyColumnGates } from './safety-column-gates.js'
import { validateSafetyColumnUniquenessGates } from './safety-column-uniqueness-gates.js'
import { validateSafetyManifestGates } from './safety-manifest-gates.js'
import type { DpmSafetyValidationInput } from './safety-types.js'
import {
  asArray,
  asRecord,
  asString,
} from './value-utils.js'

export function validateSafetyRules(input: DpmSafetyValidationInput): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const relationships = asArray(input.manifest.relationships) as Array<Record<string, unknown>>
  const columns = asArray(input.manifest.columns).map(asRecord)
  const entities = asArray(input.manifest.entities) as Array<Record<string, unknown>>
  const relationshipByName = new Map(
    relationships
      .map(relationship => [asString(relationship.name), relationship] as const)
      .filter(([name]) => name.length > 0),
  )
  const entityByName = new Map(
    entities
      .map(entity => [asString(entity.name), entity] as const)
      .filter(([name]) => name.length > 0),
  )

  diagnostics.push(...validateSafetyColumnUniquenessGates(columns))

  columns.forEach((column, index) => {
    diagnostics.push(...validateSafetyColumnGates({
      column,
      index,
      registry: input.registry,
      relationshipByName,
      entityByName,
    }))
  })

  diagnostics.push(...validateSafetyManifestGates({
    manifest: input.manifest,
    phase: input.phase,
  }))

  return diagnostics
}
