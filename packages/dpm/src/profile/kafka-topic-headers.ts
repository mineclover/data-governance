import {
  addKafkaEvidence,
  kafkaContainsEdge,
  kafkaCoordinate,
} from './kafka-profile-graph.js'
import {
  escapeKafkaProfilePathSegment,
  escapeKafkaProfilePointerSegment,
} from './kafka-profile-path.js'
import type { KafkaTopicSectionAppendInput } from './kafka-topic-section-types.js'

export function appendKafkaHeaders(input: KafkaTopicSectionAppendInput): void {
  for (const header of [...(input.topic.headers ?? [])].sort((left, right) => left.name.localeCompare(right.name))) {
    const headerPathSegment = escapeKafkaProfilePathSegment(header.name)
    const headerPointerSegment = escapeKafkaProfilePointerSegment(header.name)
    const headerPath = `${input.topic.name}.header.${headerPathSegment}`
    const headerPointer = `/headers/${headerPointerSegment}`
    const headerEvidenceId = addKafkaEvidence(input.evidenceSources, {
      id: `evidence:kafka:${headerPath}`,
      sourceId: input.sourceId,
      connectorId: input.connectorId,
      path: headerPath,
      pointer: headerPointer,
    })
    const headerNodeId = `node:header:${input.topic.name}.${headerPathSegment}`
    input.nodes.push({
      id: headerNodeId,
      kind: 'message_header',
      label: `header.${header.name}`,
      coordinate: kafkaCoordinate(input.sourceId, headerPath, headerPointer),
      dataType: header.dataType,
    })
    input.edges.push(kafkaContainsEdge(input.topic.name, input.topicNodeId, headerNodeId, headerEvidenceId))

    if (header.presenceRatio === undefined) continue
    input.metrics.push({
      id: `metric:${headerPath}.presence`,
      kind: 'presence_ratio',
      subjectId: headerNodeId,
      value: header.presenceRatio,
      unit: 'ratio',
      evidenceIds: [headerEvidenceId],
    })
  }
}
