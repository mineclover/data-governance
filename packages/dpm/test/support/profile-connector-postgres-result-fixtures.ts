import {
  normalizeDpmProfileConnectorResult,
  type DpmProfileArtifact,
  type DpmProfileConnectorResult,
} from '../../src/index.js'
import { allEvidenceCapabilities } from './profile-connector-capabilities.js'
import { completeConnectorEvidenceKinds } from './profile-connector-completed-evidence-fixtures.js'

export function createPostgresProfileConnectorResult(
  profileArtifact: DpmProfileArtifact,
): DpmProfileConnectorResult {
  return normalizeDpmProfileConnectorResult({
    connectorId: 'dpm.postgres.catalog',
    connectorVersion: '0.1.0',
    sourceKind: 'postgresql_catalog',
    captureMode: 'read_only',
    status: 'completed',
    capabilities: allEvidenceCapabilities(
      'dpm.postgres.catalog',
      '0.1.0',
      'postgresql_catalog',
      'read_only',
    ),
    observedEvidenceKinds: [...completeConnectorEvidenceKinds],
    diagnostics: [],
    profileArtifact,
  })
}
