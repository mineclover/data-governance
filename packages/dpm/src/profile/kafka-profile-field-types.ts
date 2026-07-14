import type { DpmKafkaMessageFieldFixture } from './kafka-fixture-field-types.js'
import type {
  DpmProfileEdge,
  DpmProfileMetric,
  DpmProfileNode,
} from './profile-graph-types.js'
import type { DpmProfileEvidenceSource } from './profile-source-types.js'

export type KafkaFieldProfileAppendInput = {
  topicName: string
  sourceId: string
  connectorId: string
  parentNodeId: string
  parentPath: string
  parentPointer: string
  field: DpmKafkaMessageFieldFixture
  evidenceSources: Record<string, DpmProfileEvidenceSource>
  nodes: DpmProfileNode[]
  edges: DpmProfileEdge[]
  metrics: DpmProfileMetric[]
}

export type KafkaFieldProfileContext = KafkaFieldProfileAppendInput & {
  fieldPath: string
  fieldPointer: string
  absolutePath: string
  evidenceId: string
  fieldNodeId: string
}
