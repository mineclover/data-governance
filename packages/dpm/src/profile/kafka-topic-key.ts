import {
  addKafkaEvidence,
  kafkaContainsEdge,
  kafkaCoordinate,
} from './kafka-profile-graph.js'
import type { KafkaTopicSectionAppendInput } from './kafka-topic-section-types.js'

export function appendKafkaKey(input: KafkaTopicSectionAppendInput): void {
  if (!input.topic.key) return

  const keyEvidenceId = addKafkaEvidence(input.evidenceSources, {
    id: `evidence:kafka:${input.topic.name}.key`,
    sourceId: input.sourceId,
    connectorId: input.connectorId,
    path: `${input.topic.name}.key`,
    pointer: '/key',
  })
  const keyNodeId = `node:key:${input.topic.name}`
  input.nodes.push({
    id: keyNodeId,
    kind: 'message_key',
    label: `${input.topic.name} key`,
    coordinate: kafkaCoordinate(input.sourceId, `${input.topic.name}.key`, '/key'),
    dataType: input.topic.key.dataType,
  })
  input.edges.push(kafkaContainsEdge(input.topic.name, input.topicNodeId, keyNodeId, keyEvidenceId))

  if (input.topic.key.coverageRatio === undefined) return
  input.metrics.push({
    id: `metric:${input.topic.name}.key_coverage`,
    kind: 'key_coverage_ratio',
    subjectId: keyNodeId,
    value: input.topic.key.coverageRatio,
    unit: 'ratio',
    evidenceIds: [keyEvidenceId],
  })
}
