import {
  createPostgresCatalogSnapshot,
  parseRegistrySnapshotYaml,
  type DpmValidationInput,
  type PostgresCatalogSnapshotInput,
} from '../../src/index.js'
import {
  readDpmJsonFixture,
  readDpmTextFixture,
} from './fixture-io.js'

export const expectedValidManifestDiagnosticSummary = {
  errors: 0,
  warnings: 1,
  infos: 0,
} as const

export const expectedValidManifestDiagnosticCodes = [
  'SAF007',
] as const

export const expectedValidManifestDiagnostics = [
  {
    severity: 'warning',
    code: 'SAF007',
    sourcePointer: '/quality_gates',
  },
] as const

export const expectedMissingRelationshipSafetyDiagnosticCodes = [
  'SAF007',
  'SAF012',
] as const

export function createValidationInput(): DpmValidationInput {
  return {
    manifest: readDpmJsonFixture('valid/customer-orders.json'),
    catalog: createPostgresCatalogSnapshot(
      readDpmJsonFixture<PostgresCatalogSnapshotInput>('catalog/postgres-commerce.json'),
    ),
    registry: parseRegistrySnapshotYaml(readDpmTextFixture('registry/commerce-registry.yaml')),
    phase: 'validate',
  }
}
