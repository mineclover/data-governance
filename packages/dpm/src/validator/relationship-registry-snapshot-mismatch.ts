import type { RegistryRelationship } from '../registry/registry-relationship-types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import { createRegistryMismatchDiagnostic } from './relationship-registry-diagnostics.js'
import type { ManifestRelationshipEndpoint } from './relationship-types.js'
import { sameColumns, toStringArray } from './relationship-utils.js'

export function addRegistryScalarMismatch(input: {
  diagnostics: DpmDiagnostic[]
  registry: RegistrySnapshot
  approved: RegistryRelationship
  relationshipName: string
  actual: string | undefined
  expected: string
  label: string
  sourcePointer: string
}): void {
  if (input.actual === input.expected) return
  input.diagnostics.push(createRegistryMismatchDiagnostic(input))
}

export function addRegistryEndpointMismatch(input: {
  diagnostics: DpmDiagnostic[]
  registry: RegistrySnapshot
  approved: RegistryRelationship
  relationshipName: string
  actual: ManifestRelationshipEndpoint | undefined
  expected: RegistryRelationship['parent']
  label: string
  sourcePointer: string
}): void {
  const actualTable = input.actual?.table
  const actualColumns = toStringArray(input.actual?.columns)
  if (actualTable === input.expected.table && sameColumns(actualColumns, input.expected.columns)) return
  input.diagnostics.push(createRegistryMismatchDiagnostic(input))
}
