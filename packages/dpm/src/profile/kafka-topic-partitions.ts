import {
  addKafkaEvidence,
  kafkaContainsEdge,
  kafkaCoordinate,
} from './kafka-profile-graph.js'
import type { KafkaTopicSectionAppendInput } from './kafka-topic-section-types.js'

export function appendKafkaPartitions(input: KafkaTopicSectionAppendInput): void {
  for (const partition of [...input.topic.partitions].sort((left, right) => left - right)) {
    const partitionEvidenceId = addKafkaEvidence(input.evidenceSources, {
      id: `evidence:kafka:${input.topic.name}.partition.${partition}`,
      sourceId: input.sourceId,
      connectorId: input.connectorId,
      path: `${input.topic.name}.partition.${partition}`,
      pointer: `/partitions/${partition}`,
    })
    const partitionNodeId = `node:partition:${input.topic.name}.${partition}`
    input.nodes.push({
      id: partitionNodeId,
      kind: 'partition',
      label: `${input.topic.name}[${partition}]`,
      coordinate: kafkaCoordinate(input.sourceId, `${input.topic.name}.partition.${partition}`, `/partitions/${partition}`),
      dataType: 'partition',
    })
    input.edges.push(kafkaContainsEdge(input.topic.name, input.topicNodeId, partitionNodeId, partitionEvidenceId))
  }
}

export function appendKafkaMessageRateMetric(input: KafkaTopicSectionAppendInput): void {
  if (input.topic.messageRateEstimate === undefined) return
  input.metrics.push({
    id: `metric:${input.topic.name}.message_rate_estimate`,
    kind: 'message_rate_estimate',
    subjectId: input.topicNodeId,
    value: input.topic.messageRateEstimate,
    unit: 'messages_per_second',
    evidenceIds: [input.topicEvidenceId],
  })
}
