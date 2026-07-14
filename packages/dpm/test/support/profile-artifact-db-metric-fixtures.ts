import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  DB_PROFILE_CUSTOMER_NO_NODE_ID,
  DB_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
} from './profile-artifact-db-identifiers.js'

export const dbProfileMetrics: DpmProfileArtifactInput['metrics'] = [
  {
    id: 'metric:orders.customer_no.presence',
    kind: 'presence_ratio',
    subjectId: DB_PROFILE_CUSTOMER_NO_NODE_ID,
    value: 1,
    unit: 'ratio',
    evidenceIds: [DB_PROFILE_EVIDENCE_CUSTOMER_NO_ID],
  },
]

