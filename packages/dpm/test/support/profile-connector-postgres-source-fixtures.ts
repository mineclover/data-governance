import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  POSTGRES_CONNECTOR_ID,
  POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
} from './profile-connector-postgres-identifiers.js'

export const postgresConnectorProfileSources: DpmProfileArtifactInput['sources'] = [
  {
    id: POSTGRES_CONNECTOR_PROFILE_SOURCE_ID,
    kind: 'postgresql_catalog',
    connectorId: POSTGRES_CONNECTOR_ID,
    connectorVersion: '0.1.0',
    refs: ['postgres://commerce/public'],
    captureMode: 'read_only',
    sourceVersionHash: 'sha256:postgres-catalog-v1',
  },
]

