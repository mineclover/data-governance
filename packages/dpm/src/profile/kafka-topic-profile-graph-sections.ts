import type { KafkaTopicProfileGraphContext } from './kafka-topic-profile-graph-types.js'
import {
  appendKafkaHeaders,
  appendKafkaKey,
  appendKafkaMessageRateMetric,
  appendKafkaPartitions,
  appendKafkaSchema,
} from './kafka-topic-sections.js'

export function appendKafkaTopicProfileGraphSections(input: KafkaTopicProfileGraphContext): void {
  appendKafkaPartitions(input)
  appendKafkaMessageRateMetric(input)
  appendKafkaKey(input)
  appendKafkaHeaders(input)
  appendKafkaSchema(input)
}
