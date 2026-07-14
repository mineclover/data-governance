import type {
  DpmProfileCoordinate,
  DpmProfileEvidenceSource,
} from './profile-source-types.js'
import type { DpmProfileEdge } from './profile-graph-types.js'

export type KafkaEvidenceInput = {
  id: string
  sourceId: string
  connectorId: string
  path: string
  pointer: string
  description?: string | undefined
}

export function addKafkaEvidence(
  evidenceSources: Record<string, DpmProfileEvidenceSource>,
  input: KafkaEvidenceInput,
): string {
  evidenceSources[input.id] = {
    coordinate: kafkaCoordinate(input.sourceId, input.path, input.pointer),
    connectorId: input.connectorId,
    ...(input.description ? { description: input.description } : {}),
  }
  return input.id
}

export function kafkaCoordinate(sourceId: string, path: string, pointer: string): DpmProfileCoordinate {
  return {
    kind: 'kafka_topic_bundle',
    sourceId,
    path,
    pointer,
  }
}

export function kafkaContainsEdge(topicName: string, fromNodeId: string, toNodeId: string, evidenceId: string): DpmProfileEdge {
  return {
    id: `edge:${topicName}.contains.${toNodeId.replace(/^node:/, '')}`,
    kind: 'contains',
    fromNodeId,
    toNodeId,
    evidenceIds: [evidenceId],
  }
}

export function kafkaFieldNodeIdFor(topicName: string, fieldPath: string): string {
  return `node:field:${topicName}.${fieldPath}`
}
