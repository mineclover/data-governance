import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  POSTGRES_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID,
  POSTGRES_CONNECTOR_CUSTOMER_NO_NODE_ID,
} from './profile-connector-postgres-identifiers.js'

export const postgresConnectorProfileMetrics: DpmProfileArtifactInput['metrics'] = [
  {
    id: 'metric:public.orders.customer_no.presence',
    kind: 'presence_ratio',
    subjectId: POSTGRES_CONNECTOR_CUSTOMER_NO_NODE_ID,
    value: 1,
    unit: 'ratio',
    evidenceIds: [POSTGRES_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID],
  },
]

