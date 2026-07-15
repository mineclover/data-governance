import { describe, expect, it } from 'vitest'

import {
  createDpmAuthoringIdentityIndexRows,
  createDpmPostgresAuthoringStorage,
  DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS,
  DPM_AUTHORING_STORAGE_SCHEMA_VERSION,
  type DpmPostgresAuthoringClient,
} from '../src/index.js'
import {
  createDpmAuthoringOperationalMigrationRehearsal,
} from './support/authoring-operational-migration-fixture.js'

const owner = { id: 'owner', roles: ['editor', 'reviewer', 'publisher', 'rollback'] as const }
const editor = { id: 'editor', roles: ['editor'] as const }
const reviewer = { id: 'reviewer', roles: ['reviewer'] as const }
const publisher = { id: 'publisher', roles: ['publisher'] as const }
const rollbackOperator = { id: 'rollback', roles: ['rollback'] as const }

describe('DPM operational migration rehearsal fixture', () => {
  it('covers identity lookup, breaking draft review, stale-base conflict, publish, and rollback', async () => {
    const { fixture, service } = createDpmAuthoringOperationalMigrationRehearsal()
    const initial = await service.seedPublishedRevision({
      actor: owner,
      definitionId: fixture.definitionId,
      revisionId: fixture.initialRevisionId,
      definitions: fixture.initialDefinitions,
      source: fixture.source,
    })

    expect(await service.lookup({
      actor: editor,
      definitionId: fixture.definitionId,
      query: { objectId: 'customer-number' },
    })).toMatchObject([{ field: { objectId: 'customer-number' }, revisionId: fixture.initialRevisionId }])
    expect(await service.lookup({
      actor: editor,
      definitionId: fixture.definitionId,
      query: {
        api: {
          artifactId: 'commerce-api',
          pointer: '#/components/schemas/Customer/properties/customerNo',
          versionHash: 'sha256:api-1',
        },
      },
    })).toHaveLength(1)
    expect(await service.lookup({
      actor: editor,
      definitionId: fixture.definitionId,
      query: {
        db: {
          snapshotId: 'commerce-catalog-1',
          versionHash: 'sha256:catalog-1',
          table: 'public.customers',
          column: 'customer_no',
        },
      },
    })).toHaveLength(1)

    const draft = await service.createDraft({
      actor: editor,
      definitionId: fixture.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: fixture.breakingDefinitions,
    })
    const diff = await service.previewDraft({
      actor: editor,
      definitionId: fixture.definitionId,
      draftId: draft.draftId,
    })
    expect(diff.breaking).toBe(true)
    expect(diff.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'field.changed', breaking: true }),
    ]))

    await service.submitDraft({ actor: reviewer, definitionId: fixture.definitionId, draftId: draft.draftId })
    const published = await service.publishDraft({
      actor: publisher,
      definitionId: fixture.definitionId,
      draftId: draft.draftId,
    })
    expect(published.reason).toBe('publish')
    expect(published.parentRevisionId).toBe(initial.revisionId)
    expect(published.source).toEqual(fixture.source)

    await expect(service.createDraft({
      actor: editor,
      definitionId: fixture.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: fixture.initialDefinitions,
    })).rejects.toThrow('stale base revision')

    const rolledBack = await service.rollback({
      actor: rollbackOperator,
      definitionId: fixture.definitionId,
      targetRevisionId: initial.revisionId,
    })
    expect(rolledBack.reason).toBe('rollback')
    expect(rolledBack.rollbackTargetRevisionId).toBe(initial.revisionId)
    expect(rolledBack.parentRevisionId).toBe(published.revisionId)
    expect(rolledBack.source).toEqual(fixture.source)
    expect(createDpmAuthoringIdentityIndexRows(rolledBack).map(row => row.identityKind))
      .toEqual(['api', 'db', 'object'])
    expect((await service.listAuditEvents({ actor: owner, definitionId: fixture.definitionId }))
      .map(event => event.action))
      .toEqual([
        'revision.seeded',
        'draft.created',
        'draft.submitted',
        'revision.published',
        'revision.rolled_back',
      ])
  })

  it('records additive PostgreSQL contract writes without applying SQL to a database', async () => {
    const calls: string[] = []
    const client: DpmPostgresAuthoringClient = {
      async query(sql) {
        calls.push(sql)
        return { rows: [] }
      },
      async transaction(operation) {
        return operation({
          async query(sql) {
            calls.push(sql)
            return { rows: [] }
          },
        })
      },
    }
    const { fixture, service } = createDpmAuthoringOperationalMigrationRehearsal()
    const initial = await service.seedPublishedRevision({
      actor: owner,
      definitionId: fixture.definitionId,
      revisionId: fixture.initialRevisionId,
      definitions: fixture.initialDefinitions,
      source: fixture.source,
    })
    const draft = await service.createDraft({
      actor: editor,
      definitionId: fixture.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: fixture.breakingDefinitions,
    })
    await service.submitDraft({ actor: reviewer, definitionId: fixture.definitionId, draftId: draft.draftId })
    const published = await service.publishDraft({
      actor: publisher,
      definitionId: fixture.definitionId,
      draftId: draft.draftId,
    })
    const rolledBack = await service.rollback({
      actor: rollbackOperator,
      definitionId: fixture.definitionId,
      targetRevisionId: initial.revisionId,
    })

    const storage = createDpmPostgresAuthoringStorage(client)
    await storage.putPublishedRevision(initial)
    await storage.putPublishedRevision(published)
    await storage.putPublishedRevision(rolledBack)

    expect(DPM_AUTHORING_STORAGE_SCHEMA_VERSION).toBe('1.0')
    expect(DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS).toHaveLength(5)
    expect(calls.filter(sql => sql.includes('insert into dpm.authoring_published_revisions'))).toHaveLength(3)
    expect(calls.filter(sql => sql.includes('insert into dpm.authoring_identity_index'))).toHaveLength(9)
    expect(calls.filter(sql => sql.includes('delete from dpm.authoring_identity_index'))).toHaveLength(3)
  })
})
