import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type {
  DpmRegistryRelationshipAuditEventRow,
  DpmRegistryRelationshipRow,
  PostgresCatalogProfileRow,
} from '../../src/index.js'
import { storageDemoRoot } from './storage-demo-path-fixtures.js'

export type StorageDemoPipelineFixtures = {
  manifest: Record<string, any>
  catalogRows: PostgresCatalogProfileRow[]
  registryRows: DpmRegistryRelationshipRow[]
  registryAuditEvents: DpmRegistryRelationshipAuditEventRow[]
  estimatedRows: Record<string, number>
}

export function readStorageDemoJsonFixture<T>(name: string): T {
  return JSON.parse(readFileSync(join(storageDemoRoot, name), 'utf8')) as T
}

export function readStorageDemoPipelineFixtures(): StorageDemoPipelineFixtures {
  return {
    manifest: readStorageDemoJsonFixture<Record<string, any>>('manifest.json'),
    catalogRows: readStorageDemoJsonFixture<PostgresCatalogProfileRow[]>('catalog-profile-rows.json'),
    registryRows: readStorageDemoJsonFixture<DpmRegistryRelationshipRow[]>(
      'relationship-registry-rows.json',
    ),
    registryAuditEvents: readStorageDemoJsonFixture<DpmRegistryRelationshipAuditEventRow[]>(
      'relationship-registry-audit-events.json',
    ),
    estimatedRows: readStorageDemoJsonFixture<Record<string, number>>('estimated-rows.json'),
  }
}
