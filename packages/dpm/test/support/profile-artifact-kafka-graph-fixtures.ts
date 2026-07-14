import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_PROFILE_CUSTOMER_NO_NODE_ID,
  KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
  KAFKA_PROFILE_KEY_NODE_ID,
  KAFKA_PROFILE_SOURCE_ID,
  KAFKA_PROFILE_TOPIC_NODE_ID,
} from './profile-artifact-kafka-identifiers.js'

export const kafkaProfileNodes: DpmProfileArtifactInput['nodes'] = [
  {
    id: KAFKA_PROFILE_TOPIC_NODE_ID,
    kind: 'topic',
    label: 'orders.created',
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_PROFILE_SOURCE_ID,
      path: 'orders.created',
    },
  },
  {
    id: KAFKA_PROFILE_KEY_NODE_ID,
    kind: 'message_key',
    label: 'orders.created key',
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_PROFILE_SOURCE_ID,
      path: 'orders.created.key',
      pointer: '/key',
    },
    dataType: 'string',
  },
  {
    id: KAFKA_PROFILE_CUSTOMER_NO_NODE_ID,
    kind: 'message_field',
    label: 'value.customer.customer_no',
    coordinate: {
      kind: 'kafka_topic_bundle',
      sourceId: KAFKA_PROFILE_SOURCE_ID,
      path: 'orders.created.value.customer.customer_no',
      pointer: '/value/customer/customer_no',
    },
    dataType: 'string',
  },
]

export const kafkaProfileEdges: DpmProfileArtifactInput['edges'] = [
  {
    id: 'edge:orders.created.contains.customer_no',
    kind: 'contains',
    fromNodeId: KAFKA_PROFILE_TOPIC_NODE_ID,
    toNodeId: KAFKA_PROFILE_CUSTOMER_NO_NODE_ID,
    evidenceIds: [KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID],
  },
]

