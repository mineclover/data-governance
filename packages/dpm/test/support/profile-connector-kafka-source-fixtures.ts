import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_CONNECTOR_ID,
  KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
} from './profile-connector-kafka-identifiers.js'

export const kafkaConnectorProfileSources: DpmProfileArtifactInput['sources'] = [
  {
    id: KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
    kind: 'kafka_topic_bundle',
    connectorId: KAFKA_CONNECTOR_ID,
    connectorVersion: '0.1.0',
    refs: ['kafka://commerce/orders.created'],
    captureMode: 'fixture',
    sourceVersionHash: 'sha256:kafka-topic-v1',
  },
]

