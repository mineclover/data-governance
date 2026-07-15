import { describe, expect, it } from 'vitest'

import {
  createDpmAsyncAuthoringService,
  createDpmAuthoringIdentityIndexRows,
  createDpmIdentityDataDefinitions,
  createDpmInMemoryAuthoringRepository,
  type DpmAsyncAuthoringRepository,
  type DpmAuthoringActor,
  type DpmAuthoringIdKind,
} from '../src/index.js'

const owner: DpmAuthoringActor = {
  id: 'owner',
  roles: ['editor', 'reviewer', 'publisher', 'rollback'],
}
const editor: DpmAuthoringActor = { id: 'editor', roles: ['editor'] }
const reviewer: DpmAuthoringActor = { id: 'reviewer', roles: ['reviewer'] }
const publisher: DpmAuthoringActor = { id: 'publisher', roles: ['publisher'] }
const rollbackOperator: DpmAuthoringActor = { id: 'rollback', roles: ['rollback'] }

describe('DPM async authoring service boundary', () => {
  it('runs the authoring flow through an async repository and canonical index', async () => {
    const service = createDpmAsyncAuthoringService(createOptions())
    const initial = await service.seedPublishedRevision({
      actor: owner,
      definitionId: 'customer-definition',
      revisionId: 'revision-1',
      definitions: createDefinitions('string'),
      source: {
        artifactIdentity: 'dpm.data-binding-artifact:artifact-1',
        freshnessIdentity: 'sha256:freshness-1',
      },
    })

    expect(await service.lookup({
      actor: editor,
      definitionId: initial.definitionId,
      query: {
        api: {
          artifactId: 'commerce-api',
          versionHash: 'sha256:api-1',
          pointer: '#/components/schemas/Customer/properties/customerNo',
        },
      },
    })).toMatchObject([{
      revisionId: 'revision-1',
      field: { objectId: 'customer-number' },
    }])

    const draft = await service.createDraft({
      actor: editor,
      definitionId: initial.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: createDefinitions('number'),
    })
    expect((await service.previewDraft({
      actor: editor,
      definitionId: initial.definitionId,
      draftId: draft.draftId,
    })).breaking).toBe(true)
    await service.submitDraft({ actor: reviewer, definitionId: initial.definitionId, draftId: draft.draftId })
    const published = await service.publishDraft({
      actor: publisher,
      definitionId: initial.definitionId,
      draftId: draft.draftId,
    })
    expect(published.reason).toBe('publish')

    const rolledBack = await service.rollback({
      actor: rollbackOperator,
      definitionId: initial.definitionId,
      targetRevisionId: initial.revisionId,
    })
    expect(rolledBack.reason).toBe('rollback')
    expect((await service.listAuditEvents({ actor: owner, definitionId: initial.definitionId }))
      .map(event => event.action))
      .toEqual([
        'revision.seeded',
        'draft.created',
        'draft.submitted',
        'revision.published',
        'revision.rolled_back',
      ])
  })
})

function createOptions() {
  const repository = createDpmInMemoryAuthoringRepository()
  const counters: Record<DpmAuthoringIdKind, number> = { draft: 0, revision: 0, audit: 0 }
  let tick = 0
  const asyncRepository: DpmAsyncAuthoringRepository = {
    putPublishedRevision: async revision => repository.putPublishedRevision(revision),
    getPublishedRevision: async (definitionId, revisionId) => repository.getPublishedRevision(definitionId, revisionId),
    getLatestPublishedRevision: async definitionId => repository.getLatestPublishedRevision(definitionId),
    listPublishedRevisions: async definitionId => repository.listPublishedRevisions(definitionId),
    putDraft: async draft => repository.putDraft(draft),
    getDraft: async (definitionId, draftId) => repository.getDraft(definitionId, draftId),
    appendAuditEvent: async event => repository.appendAuditEvent(event),
    listAuditEvents: async definitionId => repository.listAuditEvents(definitionId),
    lookupIdentity: async input => {
      const revision = repository.getLatestPublishedRevision('customer-definition')
      if (!revision) return []
      return createDpmAuthoringIdentityIndexRows(revision)
        .filter(row => row.identityKind === input.identityKind && row.identityKey === input.identityKey)
    },
  }
  return {
    repository: asyncRepository,
    clock: () => `2026-07-15T00:00:0${tick++}.000Z`,
    idGenerator: (kind: DpmAuthoringIdKind, definitionId: string) => `${kind}:${definitionId}:${++counters[kind]}`,
  }
}

function createDefinitions(type: 'string' | 'number') {
  return createDpmIdentityDataDefinitions({
    version: '1.1',
    fields: [{
      objectId: 'customer-number',
      revisionId: `customer-number-${type}`,
      entity: { datasetId: 'commerce', namespace: 'customer', name: 'customer' },
      name: 'customerNo',
      type,
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
      dataField: { objectId: 'customer-number', revisionId: `customer-number-${type}` },
      api: {
        artifactId: 'commerce-api',
        versionHash: 'sha256:api-1',
        pointer: '#/components/schemas/Customer/properties/customerNo',
      },
      direction: 'response',
    }],
  })
}
