import type { DpmKafkaTopicFixture } from './kafka-fixture-topic-types.js'

export type DpmKafkaTopicProfileFixture = {
  profileId: string
  datasetId: string
  profileVersion: string
  createdAt: string
  connectorId?: string
  connectorVersion?: string
  clusterRef: string
  topic: DpmKafkaTopicFixture
}
