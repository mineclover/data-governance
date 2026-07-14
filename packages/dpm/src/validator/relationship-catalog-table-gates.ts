import { createDpmDiagnostic } from './diagnostic-copy.js'
import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  isRelationshipCatalogTableUsable,
  type RelationshipCatalogGateContext,
} from './relationship-catalog-context.js'

export type RelationshipCatalogTableGateResult = {
  diagnostics: DpmDiagnostic[]
  parentTableUsable: boolean
  childTableUsable: boolean
}

export type RelationshipCatalogTableGateInput = {
  context: RelationshipCatalogGateContext
  relationshipName: string
  pointer: string
  parentTable?: string
  childTable?: string
}

export function validateRelationshipCatalogTableGates(
  input: RelationshipCatalogTableGateInput,
): RelationshipCatalogTableGateResult {
  const diagnostics: DpmDiagnostic[] = []
  const parentTableUsable = isRelationshipCatalogTableUsable(input.context, input.parentTable)
  const childTableUsable = isRelationshipCatalogTableUsable(input.context, input.childTable)

  if (!parentTableUsable) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL001',
      message: `Relationship ${input.relationshipName} parent table must be in manifest scope and catalog snapshot.`,
      sourcePointer: `${input.pointer}/parent/table`,
      catalogCoordinate: { table: input.parentTable ?? '' },
    }))
  }
  if (!childTableUsable) {
    diagnostics.push(createDpmDiagnostic({
      severity: 'error',
      code: 'REL002',
      message: `Relationship ${input.relationshipName} child table must be in manifest scope and catalog snapshot.`,
      sourcePointer: `${input.pointer}/child/table`,
      catalogCoordinate: { table: input.childTable ?? '' },
    }))
  }

  return {
    diagnostics,
    parentTableUsable,
    childTableUsable,
  }
}
