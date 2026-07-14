import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  POSTGRES_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID,
  POSTGRES_CONNECTOR_CUSTOMER_NO_NODE_ID,
  POSTGRES_CONNECTOR_ORDERS_TABLE_NODE_ID,
  POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
} from './profile-connector-postgres-identifiers.js'

export const postgresConnectorProfileNodes: DpmProfileArtifactInput['nodes'] = [
  {
    id: POSTGRES_CONNECTOR_ORDERS_TABLE_NODE_ID,
    kind: 'table',
    label: 'public.orders',
    coordinate: {
      kind: 'postgresql_catalog',
      sourceId: POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
      path: 'public.orders',
    },
  },
  {
    id: POSTGRES_CONNECTOR_CUSTOMER_NO_NODE_ID,
    kind: 'column',
    label: 'public.orders.customer_no',
    coordinate: {
      kind: 'postgresql_catalog',
      sourceId: POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
      path: 'public.orders.customer_no',
      pointer: '#/columns/public.orders.customer_no',
    },
    dataType: 'text',
  },
]

export const postgresConnectorProfileEdges: DpmProfileArtifactInput['edges'] = [
  {
    id: 'edge:public.orders.contains.customer_no',
    kind: 'contains',
    fromNodeId: POSTGRES_CONNECTOR_ORDERS_TABLE_NODE_ID,
    toNodeId: POSTGRES_CONNECTOR_CUSTOMER_NO_NODE_ID,
    evidenceIds: [POSTGRES_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID],
  },
]

