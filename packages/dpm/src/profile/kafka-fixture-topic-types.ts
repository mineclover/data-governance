import type { DpmKafkaMessageFieldFixture } from './kafka-fixture-field-types.js'
import type { DpmKafkaRelationshipHintFixture } from './kafka-fixture-hint-types.js'
import type {
  DpmKafkaHeaderFixture,
  DpmKafkaKeyFixture,
  DpmKafkaSchemaFixture,
} from './kafka-fixture-section-types.js'

export type DpmKafkaTopicFixture = {
  name: string
  partitions: number[]
  messageRateEstimate?: number
  key?: DpmKafkaKeyFixture
  headers?: DpmKafkaHeaderFixture[]
  schema?: DpmKafkaSchemaFixture
  value: {
    fields: DpmKafkaMessageFieldFixture[]
  }
  relationshipHints?: DpmKafkaRelationshipHintFixture[]
}
