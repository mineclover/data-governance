import type { CatalogSnapshot } from '../catalog/types.js'
import type { RegistrySnapshot } from '../registry/registry-snapshot-types.js'
import type { DpmApiArtifactInput } from './data-binding-types.js'

export type DpmValidationPhase = 'validate' | 'compile' | 'dry_run' | 'runtime'

export type DpmValidationInput = {
  manifest: unknown
  catalog: CatalogSnapshot
  registry: RegistrySnapshot
  apiArtifacts?: readonly DpmApiArtifactInput[]
  phase?: DpmValidationPhase
}
