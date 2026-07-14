import type { DpmKafkaTopic } from './kafka-topic-profile-input-types.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'
import type {
  DpmProfileEdge,
  DpmProfileMetric,
  DpmProfileNode,
} from './profile-graph-types.js'
import type { DpmProfileEvidenceSource } from './profile-source-types.js'

export type KafkaTopicProfileGraphInput = {
  topic: DpmKafkaTopic
  sourceId: string
  connectorId: string
}

export type KafkaTopicProfileGraph = {
  evidenceSources: Record<string, DpmProfileEvidenceSource>
  nodes: DpmProfileNode[]
  edges: DpmProfileEdge[]
  metrics: DpmProfileMetric[]
  diagnostics: DpmProfileDiagnostic[]
}

export type KafkaTopicProfileGraphContext = KafkaTopicProfileGraphInput & KafkaTopicProfileGraph & {
  topicEvidenceId: string
  topicNodeId: string
}
