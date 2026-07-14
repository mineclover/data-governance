import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_PROFILE_CONNECTOR_ID,
  KAFKA_PROFILE_SOURCE_ID,
} from './profile-artifact-kafka-identifiers.js'

export const kafkaProfileSources: DpmProfileArtifactInput['sources'] = [
  {
    id: KAFKA_PROFILE_SOURCE_ID,
    kind: 'kafka_topic_bundle',
    connectorId: KAFKA_PROFILE_CONNECTOR_ID,
    connectorVersion: '0.1.0',
    refs: ['kafka://commerce/orders.created'],
    captureMode: 'fixture',
    sourceVersionHash: 'sha256:kafka-topic-v1',
  },
]

