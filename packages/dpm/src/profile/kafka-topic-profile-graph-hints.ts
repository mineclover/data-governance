import { appendKafkaRelationshipHint } from './kafka-profile-hints.js'
import type { KafkaTopicProfileGraphContext } from './kafka-topic-profile-graph-types.js'

export function appendKafkaTopicProfileGraphRelationshipHints(input: KafkaTopicProfileGraphContext): void {
  const relationshipHints = [...(input.topic.relationshipHints ?? [])]
    .sort((left, right) => left.id.localeCompare(right.id))

  for (const hint of relationshipHints) {
    appendKafkaRelationshipHint({
      topicName: input.topic.name,
      sourceId: input.sourceId,
      connectorId: input.connectorId,
      hint,
      evidenceSources: input.evidenceSources,
      nodes: input.nodes,
      edges: input.edges,
      diagnostics: input.diagnostics,
    })
  }
}
