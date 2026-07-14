import {
  profileKafkaTopicFixture,
  type DpmKafkaTopicProfileFixture,
  type DpmProfileArtifact,
} from '../../src/index.js'
import { readDpmJsonFixture } from './fixture-io.js'

export function readKafkaOrdersCreatedFixture(): DpmKafkaTopicProfileFixture {
  return readDpmJsonFixture<DpmKafkaTopicProfileFixture>('profile/kafka-orders-created.json')
}

export function readKafkaOrdersCreatedProfileArtifact(): DpmProfileArtifact {
  const profile = profileKafkaTopicFixture(readKafkaOrdersCreatedFixture()).profileArtifact
  if (!profile) throw new Error('expected Kafka profile artifact')
  return profile
}
