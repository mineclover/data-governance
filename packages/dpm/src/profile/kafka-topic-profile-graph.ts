import { appendKafkaTopicProfileGraphFields } from './kafka-topic-profile-graph-fields.js'
import { appendKafkaTopicProfileGraphRelationshipHints } from './kafka-topic-profile-graph-hints.js'
import { appendKafkaTopicProfileGraphSections } from './kafka-topic-profile-graph-sections.js'
import type {
  KafkaTopicProfileGraph,
  KafkaTopicProfileGraphInput,
} from './kafka-topic-profile-graph-types.js'
import { appendKafkaTopicRoot } from './kafka-topic-root.js'

export type {
  KafkaTopicProfileGraph,
  KafkaTopicProfileGraphInput,
} from './kafka-topic-profile-graph-types.js'

export function createKafkaTopicProfileGraph(input: KafkaTopicProfileGraphInput): KafkaTopicProfileGraph {
  const graph: KafkaTopicProfileGraph = {
    evidenceSources: {},
    nodes: [],
    edges: [],
    metrics: [],
    diagnostics: [],
  }

  const { topicEvidenceId, topicNodeId } = appendKafkaTopicRoot({
    topic: input.topic,
    sourceId: input.sourceId,
    connectorId: input.connectorId,
    evidenceSources: graph.evidenceSources,
    nodes: graph.nodes,
  })

  const context = {
    ...input,
    ...graph,
    topicNodeId,
    topicEvidenceId,
  }

  appendKafkaTopicProfileGraphSections(context)
  appendKafkaTopicProfileGraphFields(context)
  appendKafkaTopicProfileGraphRelationshipHints(context)

  return graph
}
