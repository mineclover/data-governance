import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_PROFILE_CONNECTOR_ID,
  KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
  KAFKA_PROFILE_SOURCE_ID,
} from './profile-artifact-kafka-identifiers.js'

export const kafkaProfileEvidenceSources: DpmProfileArtifactInput['evidenceSources'] = {
  [KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID]: {
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_PROFILE_SOURCE_ID,
      path: 'orders.created.value.customer.customer_no',
      pointer: '/value/customer/customer_no',
    },
    connectorId: KAFKA_PROFILE_CONNECTOR_ID,
  },
}

