import { describe, expect, it } from 'vitest'

import {
  createDpmAuthoringIdentityIndexRows,
  createDpmIdentityDataDefinitions,
  createDpmPostgresAuthoringStorage,
  DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS,
  type DpmAuthoringPublishedRevision,
  type DpmPostgresAuthoringClient,
} from '../src/index.js'

describe('DPM Phase 8 PostgreSQL persistence contract', () => {
  it('defines durable tables and canonical identity lookup indexes without applying them', () => {
    const schema = DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS.join('\n')

    expect(DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS).toHaveLength(5)
    expect(schema).toContain('dpm.authoring_published_revisions')
    expect(schema).toContain('dpm.authoring_drafts')
    expect(schema).toContain('dpm.authoring_audit_events')
    expect(schema).toContain('dpm.authoring_identity_index')
    expect(schema).toContain('dpm_authoring_identity_lookup_idx')
  })

  it('emits one canonical object/API/DB index row per identity', () => {
    const revision = createRevision()
    const rows = createDpmAuthoringIdentityIndexRows(revision)

    expect(rows.map(row => row.identityKind)).toEqual(['api', 'db', 'object'])
    expect(rows.map(row => row.objectId)).toEqual([
      'customer-number',
      'customer-number',
      'customer-number',
    ])
    expect(Object.isFrozen(rows)).toBe(true)
    expect(rows.find(row => row.identityKind === 'api')?.identityKey)
      .toContain('api:commerce-api@sha256%3Aapi-1:')
    expect(rows.find(row => row.identityKind === 'db')?.identityKey)
      .toBe('db:commerce-catalog-1@sha256%3Acatalog-1:public.customers#customer_no')
  })

  it('uses transaction boundaries for revisions and rehydrates normalized rows', async () => {
    const calls: Array<{ sql: string; parameters: readonly unknown[] }> = []
    let client!: DpmPostgresAuthoringClient
    client = {
      async query<T>(sql, parameters) {
        calls.push({ sql, parameters })
        if (sql.startsWith('select\n  definition_id,\n  revision_id')) {
          return {
            rows: [{
              definition_id: 'customer-definition',
              revision_id: 'revision-1',
              reason: 'initial',
              definitions: JSON.stringify(createRevision().definitions),
              source: null,
              created_by: 'owner',
              created_at: '2026-07-15T00:00:00.000Z',
              parent_revision_id: null,
              rollback_target_revision_id: null,
            }],
          } as unknown as { rows: readonly T[] }
        }
        return { rows: [] as readonly T[] }
      },
      async transaction(operation) {
        return operation(client)
      },
    }
    const storage = createDpmPostgresAuthoringStorage(client)
    const revision = createRevision()

    await storage.putPublishedRevision(revision)
    expect(calls[0]?.sql).toContain('insert into dpm.authoring_published_revisions')
    expect(calls.filter(call => call.sql.includes('authoring_identity_index'))).toHaveLength(4)

    const restored = await storage.getPublishedRevision('customer-definition', 'revision-1')
    expect(restored?.definitions.version).toBe('1.1')
    expect(restored?.definitions.fields[0]?.objectId).toBe('customer-number')
  })
})

function createRevision(): DpmAuthoringPublishedRevision {
  return {
    definitionId: 'customer-definition',
    revisionId: 'revision-1',
    definitions: createDpmIdentityDataDefinitions({
      version: '1.1',
      fields: [{
        objectId: 'customer-number',
        revisionId: 'customer-number-rev-1',
        entity: { datasetId: 'commerce', namespace: 'customer', name: 'customer' },
        name: 'customerNo',
        type: 'string',
        origin: 'persisted',
        storageRef: {
          table: 'public.customers',
          column: 'customer_no',
          catalog: {
            snapshotId: 'commerce-catalog-1',
            versionHash: 'sha256:catalog-1',
          },
        },
      }],
      apiBindings: [{
        bindingId: 'customer-number-response',
        dataField: { objectId: 'customer-number', revisionId: 'customer-number-rev-1' },
        api: {
          artifactId: 'commerce-api',
          versionHash: 'sha256:api-1',
          pointer: '#/components/schemas/Customer/properties/customerNo',
        },
        direction: 'response',
      }],
    }),
    reason: 'initial',
    createdBy: 'owner',
    createdAt: '2026-07-15T00:00:00.000Z',
  }
}
