import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  DB_PROFILE_CUSTOMER_NO_NODE_ID,
  DB_PROFILE_DATASET_NODE_ID,
  DB_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
  DB_PROFILE_ORDERS_TABLE_NODE_ID,
  DB_PROFILE_SOURCE_ID,
} from './profile-artifact-db-identifiers.js'

export const dbProfileNodes: DpmProfileArtifactInput['nodes'] = [
  {
    id: DB_PROFILE_DATASET_NODE_ID,
    kind: 'dataset',
    label: 'commerce_ai',
    coordinate: {
      kind: 'manual_import',
      path: 'commerce_ai',
    },
  },
  {
    id: DB_PROFILE_ORDERS_TABLE_NODE_ID,
    kind: 'table',
    label: 'public.orders',
    coordinate: {
      kind: 'postgresql_catalog',
      sourceId: DB_PROFILE_SOURCE_ID,
      path: 'public.orders',
    },
  },
  {
    id: DB_PROFILE_CUSTOMER_NO_NODE_ID,
    kind: 'column',
    label: 'orders.customer_no',
    coordinate: {
      kind: 'postgresql_catalog',
      sourceId: DB_PROFILE_SOURCE_ID,
      path: 'public.orders.customer_no',
      pointer: '#/columns/public.orders.customer_no',
    },
    dataType: 'text',
  },
]

export const dbProfileEdges: DpmProfileArtifactInput['edges'] = [
  {
    id: 'edge:orders.contains.customer_no',
    kind: 'contains',
    fromNodeId: DB_PROFILE_ORDERS_TABLE_NODE_ID,
    toNodeId: DB_PROFILE_CUSTOMER_NO_NODE_ID,
    evidenceIds: [DB_PROFILE_EVIDENCE_CUSTOMER_NO_ID],
  },
]

