import type { CatalogSnapshot } from '../catalog/types.js'
import type {
  DpmDataBindingBehaviorTraceLink,
  DpmDataBindingReviewLink,
} from '../model/data-artifact-types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmApiArtifactInput } from '../validator/data-binding-types.js'

export type DpmCompiledPlanBuilderInput = {
  manifest: unknown
  catalog: CatalogSnapshot
  registry: RegistrySnapshot
  apiArtifacts?: readonly DpmApiArtifactInput[]
  behaviorTraceLinks?: readonly DpmDataBindingBehaviorTraceLink[]
  reviewLinks?: readonly DpmDataBindingReviewLink[]
}
