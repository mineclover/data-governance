import type { CatalogSnapshot } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmValidationResult } from '../validator/diagnostic-types.js'
import type { DpmValidationPhase } from '../validator/validation-types.js'
import type { DpmApiArtifactInput } from '../validator/data-binding-types.js'
import type {
  DpmDataBindingBehaviorTraceLink,
  DpmDataBindingReviewLink,
} from '../model/data-artifact-types.js'
import type { DpmCompiledPlan } from './plan-compiled-types.js'

export type DpmCompileInput = {
  manifest: unknown
  catalog: CatalogSnapshot
  registry: RegistrySnapshot
  apiArtifacts?: readonly DpmApiArtifactInput[]
  behaviorTraceLinks?: readonly DpmDataBindingBehaviorTraceLink[]
  reviewLinks?: readonly DpmDataBindingReviewLink[]
  phase?: DpmValidationPhase
}

export type DpmCompileSuccess = {
  ok: true
  plan: DpmCompiledPlan
  validation: DpmValidationResult
}

export type DpmCompileFailure = {
  ok: false
  diagnostics: DpmValidationResult['diagnostics']
  validation: DpmValidationResult
}

export type DpmCompileResult = DpmCompileSuccess | DpmCompileFailure
