import type { DpmProfileArtifactInput } from '../../src/index.js'
import {
  DB_PROFILE_CONNECTOR_ID,
  DB_PROFILE_SOURCE_ID,
} from './profile-artifact-db-identifiers.js'

export const dbProfileSources: DpmProfileArtifactInput['sources'] = [
  {
    id: DB_PROFILE_SOURCE_ID,
    kind: 'postgresql_catalog',
    connectorId: DB_PROFILE_CONNECTOR_ID,
    connectorVersion: '0.1.0',
    refs: ['postgres://commerce/public'],
    captureMode: 'read_only',
    sourceVersionHash: 'sha256:postgres-catalog-v1',
  },
]

