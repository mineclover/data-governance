import type {
  DpmKafkaTopicFixture,
} from './kafka-fixture-topic-types.js'
import type {
  DpmProfileEdge,
  DpmProfileMetric,
  DpmProfileNode,
} from './profile-graph-types.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'
import type { DpmProfileEvidenceSource } from './profile-source-types.js'

export type KafkaTopicSectionAppendInput = {
  topic: DpmKafkaTopicFixture
  sourceId: string
  connectorId: string
  topicNodeId: string
  topicEvidenceId: string
  evidenceSources: Record<string, DpmProfileEvidenceSource>
  nodes: DpmProfileNode[]
  edges: DpmProfileEdge[]
  metrics: DpmProfileMetric[]
  diagnostics: DpmProfileDiagnostic[]
}
