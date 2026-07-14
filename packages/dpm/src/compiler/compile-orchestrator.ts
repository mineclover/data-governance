import { validateDpmManifest } from '../validator/manifest-validator.js'
import {
  normalizeRegistrySnapshotCanonicalKeyEncodingVersion,
} from '../registry/registry-snapshot-encoding.js'
import type {
  DpmCompileInput,
  DpmCompileResult,
} from './compile-types.js'
import { createDpmCompiledPlan } from './plan-assembler.js'

export function compileDpmPlan(input: DpmCompileInput): DpmCompileResult {
  const normalizedInput = {
    ...input,
    registry: normalizeRegistrySnapshotCanonicalKeyEncodingVersion(input.registry),
    ...(input.behaviorTraceLinks ? { behaviorTraceLinks: input.behaviorTraceLinks } : {}),
    ...(input.reviewLinks ? { reviewLinks: input.reviewLinks } : {}),
  }
  const validation = validateDpmManifest({
    manifest: normalizedInput.manifest,
    catalog: normalizedInput.catalog,
    registry: normalizedInput.registry,
    ...(normalizedInput.apiArtifacts ? { apiArtifacts: normalizedInput.apiArtifacts } : {}),
    phase: normalizedInput.phase ?? 'compile',
  })
  if (validation.summary.errors > 0) {
    return {
      ok: false,
      diagnostics: validation.diagnostics,
      validation,
    }
  }

  return {
    ok: true,
    validation,
    plan: createDpmCompiledPlan(normalizedInput),
  }
}
