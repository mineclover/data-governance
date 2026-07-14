import { appendKafkaFieldProfile } from './kafka-profile-fields.js'
import type { KafkaTopicProfileGraphContext } from './kafka-topic-profile-graph-types.js'

export function appendKafkaTopicProfileGraphFields(input: KafkaTopicProfileGraphContext): void {
  for (const field of input.topic.value.fields) {
    appendKafkaFieldProfile({
      topicName: input.topic.name,
      sourceId: input.sourceId,
      connectorId: input.connectorId,
      parentNodeId: input.topicNodeId,
      parentPath: 'value',
      parentPointer: '/value',
      field,
      evidenceSources: input.evidenceSources,
      nodes: input.nodes,
      edges: input.edges,
      metrics: input.metrics,
    })
  }
}
