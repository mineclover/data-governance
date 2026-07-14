import type { DpmProfileArtifactInput } from '../../src/index.js'
import { createDbProfileInput } from './profile-artifact-db-inputs.js'

export function createReorderedDbProfileInput(): DpmProfileArtifactInput {
  const input = createDbProfileInput()
  return {
    ...input,
    nodes: [...input.nodes].reverse(),
    edges: [...input.edges].reverse(),
    metrics: [...input.metrics].reverse(),
    diagnostics: [...input.diagnostics].reverse(),
    evidenceSources: Object.fromEntries(Object.entries(input.evidenceSources).reverse()),
  }
}
