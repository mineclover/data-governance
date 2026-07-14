import type { CatalogSnapshot } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  validateRelationshipCatalogGates,
} from './relationship-catalog-gate-sequence.js'
import type {
  RelationshipCatalogGateContext,
} from './relationship-catalog-context.js'
import { validateRelationshipRegistryApproval } from './relationship-registry-approval.js'
import { validateRelationshipShapeGates } from './relationship-shape-gates.js'
import type { ManifestRelationship } from './relationship-types.js'

export type RelationshipItemGateInput = {
  catalog: CatalogSnapshot
  context: RelationshipCatalogGateContext
  registry: RegistrySnapshot
  relationship: ManifestRelationship
  pointer: string
}

export function validateRelationshipItemGates(input: RelationshipItemGateInput): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []

  diagnostics.push(...validateRelationshipRegistryApproval({
    registry: input.registry,
    relationship: input.relationship,
    pointer: input.pointer,
  }))
  diagnostics.push(...validateRelationshipCatalogGates({
    catalog: input.catalog,
    context: input.context,
    relationship: input.relationship,
    pointer: input.pointer,
  }))
  diagnostics.push(...validateRelationshipShapeGates({
    relationship: input.relationship,
    pointer: input.pointer,
  }))

  return diagnostics
}
