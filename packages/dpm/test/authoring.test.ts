import { describe, expect, it } from 'vitest'

import {
  createDpmAuthoringService,
  createDpmIdentityDataDefinitions,
  createDpmInMemoryAuthoringRepository,
  DpmAuthoringError,
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

describe('DPM private Phase 8 authoring slice', () => {
  it('looks up identities and completes draft, review, publish, and rollback', () => {
    const service = createTestService()
    const initial = service.seedPublishedRevision({
      actor: owner,
      definitionId: 'customer-definition',
      revisionId: 'revision-1',
      definitions: createDefinitions('string'),
      source: {
        artifactIdentity: 'dpm.data-binding-artifact:artifact-1',
        freshnessIdentity: 'sha256:freshness-1',
        provenanceIdentity: 'review:1',
      },
    })

    expect(initial.reason).toBe('initial')
    expect(service.lookup({
      actor: editor,
      definitionId: initial.definitionId,
      query: { objectId: 'customer-number' },
    })).toMatchObject([{
      revisionId: 'revision-1',
      field: { objectId: 'customer-number' },
    }])
    expect(service.lookup({
      actor: editor,
      definitionId: initial.definitionId,
      query: {
        api: {
          artifactId: 'commerce-api',
          versionHash: 'sha256:api-1',
          pointer: '#/components/schemas/Customer/properties/customerNo',
        },
      },
    })).toHaveLength(1)
    expect(service.lookup({
      actor: editor,
      definitionId: initial.definitionId,
      query: {
        db: {
          snapshotId: 'commerce-catalog-1',
          versionHash: 'sha256:catalog-1',
          table: 'public.customers',
          column: 'customer_no',
        },
      },
    })).toHaveLength(1)

    const draft = service.createDraft({
      actor: editor,
      definitionId: initial.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: createDefinitions('number'),
    })
    const preview = service.previewDraft({
      actor: editor,
      definitionId: initial.definitionId,
      draftId: draft.draftId,
    })
    expect(preview.breaking).toBe(true)
    expect(preview.changes).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'field.changed', breaking: true }),
    ]))
    expect(() => service.submitDraft({
      actor: editor,
      definitionId: initial.definitionId,
      draftId: draft.draftId,
    })).toThrow('requires role reviewer')

    const submitted = service.submitDraft({
      actor: reviewer,
      definitionId: initial.definitionId,
      draftId: draft.draftId,
    })
    expect(submitted.status).toBe('pending-approval')
    const published = service.publishDraft({
      actor: publisher,
      definitionId: initial.definitionId,
      draftId: draft.draftId,
    })
    expect(published.reason).toBe('publish')
    expect(published.parentRevisionId).toBe(initial.revisionId)
    expect(published.source).toEqual(initial.source)

    expect(() => service.createDraft({
      actor: editor,
      definitionId: initial.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: createDefinitions('boolean'),
    })).toThrow('stale base revision')

    const rolledBack = service.rollback({
      actor: rollbackOperator,
      definitionId: initial.definitionId,
      targetRevisionId: initial.revisionId,
    })
    expect(rolledBack.reason).toBe('rollback')
    expect(rolledBack.rollbackTargetRevisionId).toBe(initial.revisionId)
    expect(rolledBack.definitions.fields[0]?.type).toBe('string')
    expect(rolledBack.source).toEqual(initial.source)

    expect(service.listAuditEvents({ actor: owner, definitionId: initial.definitionId })
      .map(event => event.action))
      .toEqual([
        'revision.seeded',
        'draft.created',
        'draft.submitted',
        'revision.published',
        'revision.rolled_back',
      ])
  })

  it('rejects stale publication and freezes returned revision data', () => {
    const service = createTestService()
    const initial = service.seedPublishedRevision({
      actor: owner,
      definitionId: 'customer-definition',
      revisionId: 'revision-1',
      definitions: createDefinitions('string'),
    })
    const firstDraft = service.createDraft({
      actor: editor,
      definitionId: initial.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: createDefinitions('number'),
    })
    const secondDraft = service.createDraft({
      actor: editor,
      definitionId: initial.definitionId,
      baseRevisionId: initial.revisionId,
      definitions: createDefinitions('boolean'),
    })
    service.submitDraft({ actor: reviewer, definitionId: initial.definitionId, draftId: firstDraft.draftId })
    service.publishDraft({ actor: publisher, definitionId: initial.definitionId, draftId: firstDraft.draftId })
    service.submitDraft({ actor: reviewer, definitionId: initial.definitionId, draftId: secondDraft.draftId })

    expect(() => service.publishDraft({
      actor: publisher,
      definitionId: initial.definitionId,
      draftId: secondDraft.draftId,
    })).toThrow('stale draft base')

    const current = service.getPublishedRevision({ actor: owner, definitionId: initial.definitionId })
    expect(current).toBeDefined()
    expect(Object.isFrozen(current)).toBe(true)
    expect(Object.isFrozen(current?.definitions)).toBe(true)
    expect(Object.isFrozen(current?.definitions.fields)).toBe(true)
    expect(Object.isFrozen(service.listAuditEvents({ actor: owner, definitionId: initial.definitionId }))).toBe(true)
  })

  it('rejects actors without a role and preserves deterministic error codes', () => {
    const service = createTestService()
    const actor: DpmAuthoringActor = { id: 'anonymous', roles: [] }

    expect(() => service.lookup({
      actor,
      definitionId: 'customer-definition',
      query: { objectId: 'customer-number' },
    })).toThrow(DpmAuthoringError)
    try {
      service.lookup({ actor, definitionId: 'customer-definition', query: { objectId: 'customer-number' } })
    } catch (error) {
      expect(error).toBeInstanceOf(DpmAuthoringError)
      expect((error as DpmAuthoringError).code).toBe('forbidden')
    }
  })
})

function createTestService() {
  const counters: Record<DpmAuthoringIdKind, number> = { draft: 0, revision: 0, audit: 0 }
  let tick = 0
  return createDpmAuthoringService({
    repository: createDpmInMemoryAuthoringRepository(),
    clock: () => `2026-07-15T00:00:0${tick++}.000Z`,
    idGenerator: (kind, definitionId) => `${kind}:${definitionId}:${++counters[kind]}`,
  })
}

function createDefinitions(type: 'string' | 'number' | 'boolean') {
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
