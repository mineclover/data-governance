import type { DpmDiagnostic } from './diagnostic-types.js'
import {
  createRelationshipCatalogGateContext,
} from './relationship-catalog-context.js'
import {
  validateRelationshipItemGates,
} from './relationship-gate-runner.js'
import { validateRelationshipRegistryReference } from './relationship-registry-reference.js'
import type {
  RelationshipValidationInput,
} from './relationship-types.js'

export function validateManifestRelationships(input: RelationshipValidationInput): DpmDiagnostic[] {
  const diagnostics: DpmDiagnostic[] = []
  const catalogContext = createRelationshipCatalogGateContext({
    catalog: input.catalog,
    scopeTables: input.scopeTables,
  })
  diagnostics.push(...validateRelationshipRegistryReference({
    ...(input.metadataDatasetId ? { metadataDatasetId: input.metadataDatasetId } : {}),
    ...(input.registryReference ? { registryReference: input.registryReference } : {}),
    registry: input.registry,
  }))

  input.relationships.forEach((relationship, index) => {
    const pointer = `/relationships/${index}`
    diagnostics.push(...validateRelationshipItemGates({
      catalog: input.catalog,
      context: catalogContext,
      registry: input.registry,
      relationship,
      pointer,
    }))
  })

  return diagnostics
}
