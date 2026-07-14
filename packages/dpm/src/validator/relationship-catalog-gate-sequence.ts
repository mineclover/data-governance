import type { CatalogSnapshot } from '../catalog/types.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import { validateRelationshipCatalogColumnGates } from './relationship-catalog-column-flow.js'
import type { RelationshipCatalogGateContext } from './relationship-catalog-context.js'
import { createRelationshipCatalogEndpointContext } from './relationship-catalog-endpoints.js'
import {
  createRelationshipCatalogColumnGateInput,
} from './relationship-catalog-column-gate-input.js'
import {
  createRelationshipCatalogParentKeyGateInput,
} from './relationship-catalog-parent-key-gate-input.js'
import {
  createRelationshipCatalogTableGateInput,
} from './relationship-catalog-table-gate-input.js'
import { validateRelationshipCatalogParentKeyGate } from './relationship-catalog-parent-key-flow.js'
import { validateRelationshipCatalogTableGates } from './relationship-catalog-table-gates.js'
import type { ManifestRelationship } from './relationship-types.js'

export type RelationshipCatalogGateSequenceInput = {
  catalog: CatalogSnapshot
  context: RelationshipCatalogGateContext
  relationship: ManifestRelationship
  pointer: string
}

export function validateRelationshipCatalogGates(
  input: RelationshipCatalogGateSequenceInput,
): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const relationship = createRelationshipCatalogEndpointContext(input.relationship)
  const tableGates = validateRelationshipCatalogTableGates(createRelationshipCatalogTableGateInput({
    context: input.context,
    relationship,
    pointer: input.pointer,
  }))

  diagnostics.push(...tableGates.diagnostics)
  const columnGateInput = createRelationshipCatalogColumnGateInput({
    catalog: input.catalog,
    relationship,
    pointer: input.pointer,
    tableGates,
  })
  diagnostics.push(...validateRelationshipCatalogColumnGates(columnGateInput))

  const parentKeyGateInput = createRelationshipCatalogParentKeyGateInput({
    catalog: input.catalog,
    relationship,
    pointer: input.pointer,
    tableGates,
  })
  diagnostics.push(...validateRelationshipCatalogParentKeyGate(parentKeyGateInput))

  return diagnostics
}
