import type { DpmProfileArtifactInput } from './artifact.js'
import type { DpmKafkaTopicProfileInput } from './kafka-topic-profile-input-types.js'
import { createKafkaTopicProfileGraph } from './kafka-topic-profile-graph.js'
import { createKafkaTopicSourceDescriptor } from './kafka-topic-source.js'

export type KafkaTopicProfileArtifactInputOptions = {
  input: DpmKafkaTopicProfileInput
  connectorId: string
  connectorVersion: string
  captureMode: DpmKafkaTopicProfileInput['captureMode']
}

export function createKafkaTopicProfileArtifactInput(
  options: KafkaTopicProfileArtifactInputOptions,
): DpmProfileArtifactInput {
  const { input, connectorId, connectorVersion, captureMode } = options
  const source = createKafkaTopicSourceDescriptor({
    profile: input,
    connectorId,
    connectorVersion,
    captureMode,
  })
  const sourceId = source.id
  const graph = createKafkaTopicProfileGraph({
    topic: input.topic,
    sourceId,
    connectorId,
  })

  return {
    profileId: input.profileId,
    datasetId: input.datasetId,
    profileVersion: input.profileVersion,
    createdAt: input.createdAt,
    sources: [source],
    evidenceSources: graph.evidenceSources,
    nodes: graph.nodes,
    edges: graph.edges,
    metrics: graph.metrics,
    diagnostics: graph.diagnostics,
  }
}
