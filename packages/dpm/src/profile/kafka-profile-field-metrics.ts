import type { KafkaFieldProfileContext } from './kafka-profile-field-types.js'

export function appendKafkaFieldProfileMetrics(context: KafkaFieldProfileContext): void {
  if (context.field.presenceRatio !== undefined) {
    context.metrics.push({
      id: `metric:${context.absolutePath}.presence`,
      kind: 'presence_ratio',
      subjectId: context.fieldNodeId,
      value: context.field.presenceRatio,
      unit: 'ratio',
      evidenceIds: [context.evidenceId],
    })
  }
  if (context.field.nullRatio !== undefined) {
    context.metrics.push({
      id: `metric:${context.absolutePath}.null`,
      kind: 'null_ratio',
      subjectId: context.fieldNodeId,
      value: context.field.nullRatio,
      unit: 'ratio',
      evidenceIds: [context.evidenceId],
    })
  }
}
