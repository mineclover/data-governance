import type { DpmProfileCaptureMode } from './profile-taxonomy.js'
import type { DpmKafkaMessageFieldFixture } from './kafka-fixture-field-types.js'
import type { DpmKafkaRelationshipHintFixture } from './kafka-fixture-hint-types.js'
import type {
  DpmKafkaHeaderFixture,
  DpmKafkaKeyFixture,
  DpmKafkaSchemaFixture,
} from './kafka-fixture-section-types.js'
import type { DpmKafkaTopicFixture } from './kafka-fixture-topic-types.js'

export const DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES = [
  'fixture',
  'snapshot',
  'read_only',
  'manual',
] as const satisfies readonly DpmProfileCaptureMode[]

export type DpmKafkaTopicProfileCaptureMode = typeof DPM_KAFKA_TOPIC_PROFILE_CAPTURE_MODES[number]
export type DpmKafkaMessageField = DpmKafkaMessageFieldFixture
export type DpmKafkaRelationshipHint = DpmKafkaRelationshipHintFixture
export type DpmKafkaHeader = DpmKafkaHeaderFixture
export type DpmKafkaKey = DpmKafkaKeyFixture
export type DpmKafkaSchema = DpmKafkaSchemaFixture
export type DpmKafkaTopic = DpmKafkaTopicFixture

export type DpmKafkaTopicProfileInput = {
  profileId: string
  datasetId: string
  profileVersion: string
  createdAt: string
  captureMode?: DpmKafkaTopicProfileCaptureMode
  connectorId?: string
  connectorVersion?: string
  clusterRef: string
  topic: DpmKafkaTopic
}
