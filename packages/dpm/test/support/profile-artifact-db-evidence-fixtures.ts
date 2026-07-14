import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  DB_PROFILE_CONNECTOR_ID,
  DB_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
  DB_PROFILE_SOURCE_ID,
} from './profile-artifact-db-identifiers.js'

export const dbProfileEvidenceSources: DpmProfileArtifactInput['evidenceSources'] = {
  [DB_PROFILE_EVIDENCE_CUSTOMER_NO_ID]: {
    coordinate: {
      kind: 'postgresql_catalog',
      sourceId: DB_PROFILE_SOURCE_ID,
      path: 'public.orders.customer_no',
      pointer: '#/columns/public.orders.customer_no',
    },
    connectorId: DB_PROFILE_CONNECTOR_ID,
    capturedAt: '2026-07-04T00:00:00.000Z',
  },
}

