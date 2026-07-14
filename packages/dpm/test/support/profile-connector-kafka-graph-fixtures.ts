import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID,
  KAFKA_CONNECTOR_CUSTOMER_NO_NODE_ID,
  KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
  KAFKA_CONNECTOR_TOPIC_NODE_ID,
} from './profile-connector-kafka-identifiers.js'

export const kafkaConnectorProfileNodes: DpmProfileArtifactInput['nodes'] = [
  {
    id: KAFKA_CONNECTOR_TOPIC_NODE_ID,
    kind: 'topic',
    label: 'orders.created',
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
      path: 'orders.created',
    },
  },
  {
    id: KAFKA_CONNECTOR_CUSTOMER_NO_NODE_ID,
    kind: 'message_field',
    label: 'value.customer.customer_no',
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_CONNECTOR_PROFILE_SOURCE_ID,
      path: 'orders.created.value.customer.customer_no',
      pointer: '/value/customer/customer_no',
    },
    dataType: 'string',
  },
]

export const kafkaConnectorProfileEdges: DpmProfileArtifactInput['edges'] = [
  {
    id: 'edge:orders.created.contains.customer_no',
    kind: 'contains',
    fromNodeId: KAFKA_CONNECTOR_TOPIC_NODE_ID,
    toNodeId: KAFKA_CONNECTOR_CUSTOMER_NO_NODE_ID,
    evidenceIds: [KAFKA_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID],
  },
]

