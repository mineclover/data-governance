import type { DpmProfileArtifactInput } from '../../src/index.js'
import { kafkaProfileDiagnostics } from './profile-artifact-kafka-diagnostic-fixtures.js'
import { kafkaProfileEvidenceSources } from './profile-artifact-kafka-evidence-fixtures.js'
import {
  kafkaProfileEdges,
  kafkaProfileNodes,
} from './profile-artifact-kafka-graph-fixtures.js'
import { kafkaProfileMetrics } from './profile-artifact-kafka-metric-fixtures.js'
import { kafkaProfileSources } from './profile-artifact-kafka-source-fixtures.js'

export function createKafkaProfileInput(): DpmProfileArtifactInput {
  return {
    profileId: 'profile:commerce-events',
    datasetId: 'commerce_ai',
    profileVersion: '2026-07-04.kafka',
    createdAt: '2026-07-04T00:00:00.000Z',
    sources: structuredClone(kafkaProfileSources),
    evidenceSources: structuredClone(kafkaProfileEvidenceSources),
    nodes: structuredClone(kafkaProfileNodes),
    edges: structuredClone(kafkaProfileEdges),
    metrics: structuredClone(kafkaProfileMetrics),
    diagnostics: structuredClone(kafkaProfileDiagnostics),
  }
}
