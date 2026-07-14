import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
  KAFKA_PROFILE_KEY_NODE_ID,
} from './profile-artifact-kafka-identifiers.js'

export const kafkaProfileMetrics: DpmProfileArtifactInput['metrics'] = [
  {
    id: 'metric:orders.created.key_coverage',
    kind: 'key_coverage_ratio',
    subjectId: KAFKA_PROFILE_KEY_NODE_ID,
    value: 0.998,
    unit: 'ratio',
    evidenceIds: [KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID],
  },
]

