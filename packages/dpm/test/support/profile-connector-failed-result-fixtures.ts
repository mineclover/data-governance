import {
  normalizeDpmProfileConnectorResult,
  type DpmProfileConnectorResult,
} from '../../src/index.js'
import { allEvidenceCapabilities } from './profile-connector-capabilities.js'

export function createFailedKafkaProfileConnectorResult(): DpmProfileConnectorResult {
  return normalizeDpmProfileConnectorResult({
    connectorId: 'dpm.kafka.fixture',
    connectorVersion: '0.1.0',
    sourceKind: 'kafka_topic_bundle',
    captureMode: 'fixture',
    status: 'failed',
    capabilities: allEvidenceCapabilities(
      'dpm.kafka.fixture',
      '0.1.0',
      'kafka_topic_bundle',
      'fixture',
    ),
    observedEvidenceKinds: ['diagnostic'],
    diagnostics: [
      {
        severity: 'error',
        code: 'CONN500',
        message: 'Kafka topic fixture could not be loaded.',
        connectorId: 'dpm.kafka.fixture',
        coordinate: {
          kind: 'kafka_topic_bundle',
          path: 'orders.created',
        },
      },
    ],
  })
}
