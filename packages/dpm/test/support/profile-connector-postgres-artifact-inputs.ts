import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  postgresConnectorProfileEvidenceSources,
} from './profile-connector-postgres-evidence-fixtures.js'
import {
  postgresConnectorProfileEdges,
  postgresConnectorProfileNodes,
} from './profile-connector-postgres-graph-fixtures.js'
import {
  postgresConnectorProfileMetrics,
} from './profile-connector-postgres-metric-fixtures.js'
import {
  postgresConnectorProfileSources,
} from './profile-connector-postgres-source-fixtures.js'

export function createPostgresProfileArtifactInput(): DpmProfileArtifactInput {
  return {
    profileId: 'profile:commerce-db',
    datasetId: 'commerce_ai',
    profileVersion: '2026-07-04.db',
    createdAt: '2026-07-04T00:00:00.000Z',
    sources: structuredClone(postgresConnectorProfileSources),
    evidenceSources: structuredClone(postgresConnectorProfileEvidenceSources),
    nodes: structuredClone(postgresConnectorProfileNodes),
    edges: structuredClone(postgresConnectorProfileEdges),
    metrics: structuredClone(postgresConnectorProfileMetrics),
    diagnostics: [],
  }
}
