import type {
  DpmDiagnostic,
  DpmValidationResult,
} from './diagnostic-types.js'
import {
  normalizeRegistrySnapshotCanonicalKeyEncodingVersion,
} from '../registry/registry-snapshot-encoding.js'
import {
  sortDpmDiagnostics,
  summarizeDpmDiagnostics,
} from './diagnostic-summary.js'
import { createDpmManifestValidationContext } from './manifest-context.js'
import { validateManifestSyntax } from './manifest-syntax.js'
import { validateManifestRelationships } from './relationship-validator.js'
import { validateSafetyRules } from './safety-validator.js'
import { validateDpmDataBindings } from './data-binding-validator.js'
import type { DpmValidationInput } from './validation-types.js'

export function validateDpmManifest(input: DpmValidationInput): DpmValidationResult {
  const registry = normalizeRegistrySnapshotCanonicalKeyEncodingVersion(input.registry)
  const context = createDpmManifestValidationContext(input.manifest)
  const diagnostics: DpmDiagnostic[] = [
    ...validateManifestSyntax(input.manifest),
    ...validateDpmDataBindings({
      manifest: context.manifest,
      catalog: input.catalog,
      ...(input.apiArtifacts ? { apiArtifacts: input.apiArtifacts } : {}),
    }),
    ...validateManifestRelationships({
      relationships: context.relationships,
      scopeTables: context.scopeTables,
      ...(context.metadataDatasetId ? { metadataDatasetId: context.metadataDatasetId } : {}),
      ...(context.registryReference ? { registryReference: context.registryReference } : {}),
      catalog: input.catalog,
      registry,
    }),
    ...validateSafetyRules({
      manifest: context.manifest,
      registry,
      phase: input.phase ?? 'validate',
    }),
  ]
  const sorted = sortDpmDiagnostics(diagnostics)
  const summary = summarizeDpmDiagnostics(sorted)

  return {
    valid: summary.errors === 0,
    diagnostics: sorted,
    summary,
  }
}
