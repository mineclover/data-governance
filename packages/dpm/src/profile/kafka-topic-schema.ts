import {
  addKafkaEvidence,
  kafkaCoordinate,
} from './kafka-profile-graph.js'
import {
  escapeKafkaProfilePathSegment,
} from './kafka-profile-path.js'
import type { KafkaTopicSectionAppendInput } from './kafka-topic-section-types.js'

export function appendKafkaSchema(input: KafkaTopicSectionAppendInput): void {
  if (!input.topic.schema) return

  const schemaSubjectPathSegment = escapeKafkaProfilePathSegment(input.topic.schema.subject)
  const schemaPath = `${input.topic.name}.schema.${schemaSubjectPathSegment}`
  const schemaEvidenceId = addKafkaEvidence(input.evidenceSources, {
    id: `evidence:kafka:${schemaPath}`,
    sourceId: input.sourceId,
    connectorId: input.connectorId,
    path: schemaPath,
    pointer: '/schema',
    description: input.topic.schema.format,
  })
  const schemaNodeId = `node:schema-subject:${schemaSubjectPathSegment}`
  const schemaShape = input.topic.schema.versions.length > 0
    ? { latestVersion: Math.max(...input.topic.schema.versions) }
    : {}
  input.nodes.push({
    id: schemaNodeId,
    kind: 'schema_subject',
    label: input.topic.schema.subject,
    coordinate: kafkaCoordinate(input.sourceId, schemaPath, '/schema'),
    dataType: input.topic.schema.format,
    ...(Object.keys(schemaShape).length > 0 ? { shape: schemaShape } : {}),
  })
  input.edges.push({
    id: `edge:${input.topic.name}.schema_version_of.${schemaSubjectPathSegment}`,
    kind: 'schema_version_of',
    fromNodeId: schemaNodeId,
    toNodeId: input.topicNodeId,
    evidenceIds: [schemaEvidenceId],
  })
  input.metrics.push({
    id: `metric:${input.topic.name}.schema_version_count`,
    kind: 'schema_version_count',
    subjectId: schemaNodeId,
    value: input.topic.schema.versions.length,
    unit: 'versions',
    evidenceIds: [schemaEvidenceId],
  })

  if (input.topic.schema.versions.length === 0) {
    input.diagnostics.push({
      severity: 'warning',
      code: 'PROF302',
      message: `Kafka schema subject ${input.topic.schema.subject} did not include observed versions.`,
      connectorId: input.connectorId,
      coordinate: kafkaCoordinate(input.sourceId, schemaPath, '/schema/versions'),
      evidenceIds: [schemaEvidenceId],
    })
  }
}
