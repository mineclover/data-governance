import type { DpmProfileArtifact } from './profile-artifact-types.js'

export type DpmProfileArtifactInput = Omit<DpmProfileArtifact, 'kind' | 'freshness'> & {
  sourceVersionHashes?: Readonly<Record<string, string>>
}
