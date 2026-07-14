import type { DpmProfileArtifactInput } from '../../src/index.js'
import { dbProfileEvidenceSources } from './profile-artifact-db-evidence-fixtures.js'
import {
  dbProfileEdges,
  dbProfileNodes,
} from './profile-artifact-db-graph-fixtures.js'
import { dbProfileMetrics } from './profile-artifact-db-metric-fixtures.js'
import { dbProfileSources } from './profile-artifact-db-source-fixtures.js'

export function createDbProfileInput(): DpmProfileArtifactInput {
  return {
    profileId: 'profile:commerce-db',
    datasetId: 'commerce_ai',
    profileVersion: '2026-07-04.db',
    createdAt: '2026-07-04T00:00:00.000Z',
    sources: structuredClone(dbProfileSources),
    evidenceSources: structuredClone(dbProfileEvidenceSources),
    nodes: structuredClone(dbProfileNodes),
    edges: structuredClone(dbProfileEdges),
    metrics: structuredClone(dbProfileMetrics),
    diagnostics: [],
  }
}
