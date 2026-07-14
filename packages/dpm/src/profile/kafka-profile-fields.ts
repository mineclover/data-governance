import { createKafkaFieldProfileContext } from './kafka-profile-field-context.js'
import { appendKafkaFieldProfileMetrics } from './kafka-profile-field-metrics.js'
import { appendKafkaFieldProfileNode } from './kafka-profile-field-nodes.js'
import type { KafkaFieldProfileAppendInput } from './kafka-profile-field-types.js'

export type { KafkaFieldProfileAppendInput } from './kafka-profile-field-types.js'

export function appendKafkaFieldProfile(input: KafkaFieldProfileAppendInput): void {
  const context = createKafkaFieldProfileContext(input)
  appendKafkaFieldProfileNode(context)
  appendKafkaFieldProfileMetrics(context)

  for (const child of input.field.fields ?? []) {
    appendKafkaFieldProfile({
      ...input,
      parentNodeId: context.fieldNodeId,
      parentPath: context.fieldPath,
      parentPointer: context.fieldPointer,
      field: child,
    })
  }
}
