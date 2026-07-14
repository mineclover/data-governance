import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID,
  KAFKA_CONNECTOR_ID,
  KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
} from './profile-connector-kafka-identifiers.js'

export const kafkaConnectorProfileEvidenceSources: DpmProfileArtifactInput['evidenceSources'] = {
  [KAFKA_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID]: {
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
      path: 'orders.created.value.customer.customer_no',
      pointer: '/value/customer/customer_no',
    },
    connectorId: KAFKA_CONNECTOR_ID,
  },
}
