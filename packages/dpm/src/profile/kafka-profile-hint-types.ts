import type { DpmKafkaRelationshipHintFixture } from './kafka-fixture-hint-types.js'
import type {
  DpmProfileEdge,
  DpmProfileNode,
} from './profile-graph-types.js'
import type { DpmProfileDiagnostic } from './profile-artifact-types.js'
import type { DpmProfileEvidenceSource } from './profile-source-types.js'

export type KafkaRelationshipHintContext = {
  topicName: string
  sourceId: string
  connectorId: string
  hint: DpmKafkaRelationshipHintFixture
}

export type KafkaRelationshipHintAppendInput = KafkaRelationshipHintContext & {
  evidenceSources: Record<string, DpmProfileEvidenceSource>
  nodes: DpmProfileNode[]
  edges: DpmProfileEdge[]
  diagnostics: DpmProfileDiagnostic[]
}
