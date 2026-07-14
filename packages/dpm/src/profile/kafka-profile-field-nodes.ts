import {
  kafkaContainsEdge,
  kafkaCoordinate,
} from './kafka-profile-evidence.js'
import type { KafkaFieldProfileContext } from './kafka-profile-field-types.js'

export function appendKafkaFieldProfileNode(context: KafkaFieldProfileContext): void {
  context.nodes.push({
    id: context.fieldNodeId,
    kind: 'message_field',
    label: context.fieldPath,
    coordinate: kafkaCoordinate(context.sourceId, context.absolutePath, context.fieldPointer),
    dataType: context.field.dataType,
  })
  context.edges.push(kafkaContainsEdge(
    context.topicName,
    context.parentNodeId,
    context.fieldNodeId,
    context.evidenceId,
  ))
}
