import {
  normalizeDpmProfileConnectorResult,
  type DpmProfileArtifact,
  type DpmProfileConnectorCapabilities,
  type DpmProfileConnectorEvidenceKind,
  type DpmProfileConnectorResult,
} from '../../src/index.js'
import { allEvidenceCapabilities } from './profile-connector-capabilities.js'
import { completeConnectorEvidenceKinds } from './profile-connector-completed-evidence-fixtures.js'

export type KafkaProfileConnectorResultFixtureInput = {
  readonly profileArtifact: DpmProfileArtifact
  readonly capabilities?: DpmProfileConnectorCapabilities
  readonly observedEvidenceKinds?: readonly DpmProfileConnectorEvidenceKind[]
}

export function createKafkaProfileConnectorResult({
  profileArtifact,
  capabilities = allEvidenceCapabilities(
    'dpm.kafka.fixture',
    '0.1.0',
    'kafka_topic_bundle',
    'fixture',
  ),
  observedEvidenceKinds = completeConnectorEvidenceKinds,
}: KafkaProfileConnectorResultFixtureInput): DpmProfileConnectorResult {
  return normalizeDpmProfileConnectorResult({
    connectorId: 'dpm.kafka.fixture',
    connectorVersion: '0.1.0',
    sourceKind: 'kafka_topic_bundle',
    captureMode: 'fixture',
    status: 'completed',
    capabilities,
    observedEvidenceKinds: [...observedEvidenceKinds],
    diagnostics: [],
    profileArtifact,
  })
}
