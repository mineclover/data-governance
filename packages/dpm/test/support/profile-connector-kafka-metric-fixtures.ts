import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID,
  KAFKA_CONNECTOR_CUSTOMER_NO_NODE_ID,
} from './profile-connector-kafka-identifiers.js'

export const kafkaConnectorProfileMetrics: DpmProfileArtifactInput['metrics'] = [
  {
    id: 'metric:orders.created.customer_no.presence',
    kind: 'presence_ratio',
    subjectId: KAFKA_CONNECTOR_CUSTOMER_NO_NODE_ID,
    value: 0.997,
    unit: 'ratio',
    evidenceIds: [KAFKA_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID],
  },
]

