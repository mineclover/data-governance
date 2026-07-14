import {
  unsafeRelationshipDiagnosticColumns,
} from './validator-relationship-diagnostic-columns.js'
import {
  createUnsafeRelationshipDiagnosticRelationships,
} from './validator-relationship-diagnostic-relationships.js'

export function applyUnsafeRelationshipDiagnosticManifestMutations(
  manifest: Record<string, any>,
): void {
  manifest.relationship_registry.registry_version = 'reg-stale'
  manifest.vault.mode = 'runtime'
  manifest.quality_gates = []
  manifest.entities[0].namespace = 'account'
  manifest.relationships = createUnsafeRelationshipDiagnosticRelationships(
    manifest.relationships[0],
  )
  manifest.columns = structuredClone(unsafeRelationshipDiagnosticColumns)
}

