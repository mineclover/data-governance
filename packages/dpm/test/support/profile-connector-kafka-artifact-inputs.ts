import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  kafkaConnectorProfileEvidenceSources,
} from './profile-connector-kafka-evidence-fixtures.js'
import {
  kafkaConnectorProfileEdges,
  kafkaConnectorProfileNodes,
} from './profile-connector-kafka-graph-fixtures.js'
import {
  kafkaConnectorProfileMetrics,
} from './profile-connector-kafka-metric-fixtures.js'
import {
  kafkaConnectorProfileSources,
} from './profile-connector-kafka-source-fixtures.js'

export function createKafkaProfileArtifactInput(): DpmProfileArtifactInput {
  return {
    profileId: 'profile:commerce-events',
    datasetId: 'commerce_ai',
    profileVersion: '2026-07-04.kafka',
    createdAt: '2026-07-04T00:00:00.000Z',
    sources: structuredClone(kafkaConnectorProfileSources),
    evidenceSources: structuredClone(kafkaConnectorProfileEvidenceSources),
    nodes: structuredClone(kafkaConnectorProfileNodes),
    edges: structuredClone(kafkaConnectorProfileEdges),
    metrics: structuredClone(kafkaConnectorProfileMetrics),
    diagnostics: [],
  }
}
