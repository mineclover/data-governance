import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  POSTGRES_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID,
  POSTGRES_CONNECTOR_ID,
  POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
} from './profile-connector-postgres-identifiers.js'

export const postgresConnectorProfileEvidenceSources: DpmProfileArtifactInput['evidenceSources'] = {
  [POSTGRES_CONNECTOR_CUSTOMER_NO_EVIDENCE_ID]: {
    coordinate: {
      kind: 'postgresql_catalog',
      sourceId: POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
      path: 'public.orders.customer_no',
      pointer: '#/columns/public.orders.customer_no',
    },
    connectorId: POSTGRES_CONNECTOR_ID,
  },
}
