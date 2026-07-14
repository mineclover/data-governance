import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  KAFKA_PROFILE_CONNECTOR_ID,
  KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID,
} from './profile-artifact-kafka-identifiers.js'

export const kafkaProfileDiagnostics: DpmProfileArtifactInput['diagnostics'] = [
  {
    severity: 'info',
    code: 'CONN001',
    message: 'Kafka topic profile was loaded from fixture evidence.',
    connectorId: KAFKA_PROFILE_CONNECTOR_ID,
    evidenceIds: [KAFKA_PROFILE_EVIDENCE_CUSTOMER_NO_ID],
  },
]

