import { describe, expect, it } from 'vitest'

import {
  DPM_AUTHORING_BACKEND_ENV,
  DPM_DEFAULT_AUTHORING_BACKEND,
  createDpmConfiguredAsyncAuthoringService,
  createDpmIdentityDataDefinitions,
  isDpmAuthoringBackend,
  resolveDpmAuthoringBackend,
  selectDpmAuthoringBackendAdapter,
  type DpmAsyncAuthoringRepository,
  type DpmAuthoringActor,
  type DpmAuthoringAuditEvent,
  type DpmAuthoringDraft,
  type DpmAuthoringIdentityIndexRow,
  type DpmAuthoringPublishedRevision,
} from '../src/index.js'

describe('DPM authoring backend configuration contract', () => {
  it('defaults to memory when the environment is unset', () => {
    expect(resolveDpmAuthoringBackend({ env: {} })).toEqual({
      backend: DPM_DEFAULT_AUTHORING_BACKEND,
      source: 'default',
    })
  })

  it('resolves the environment variable and preserves the explicit override', () => {
    expect(resolveDpmAuthoringBackend({
      env: { [DPM_AUTHORING_BACKEND_ENV]: ' postgres ', },
    })).toEqual({ backend: 'postgres', source: 'environment' })

    expect(resolveDpmAuthoringBackend({
      backend: 'memory',
      env: { [DPM_AUTHORING_BACKEND_ENV]: 'postgres' },
    })).toEqual({ backend: 'memory', source: 'explicit' })
  })

  it('rejects invalid values instead of silently falling back', () => {
    expect(() => resolveDpmAuthoringBackend({
      env: { [DPM_AUTHORING_BACKEND_ENV]: 'sqlite' },
    })).toThrow('memory, postgres')
    expect(() => resolveDpmAuthoringBackend({ backend: '' })).toThrow('memory, postgres')
    expect(isDpmAuthoringBackend('memory')).toBe(true)
    expect(isDpmAuthoringBackend('sqlite')).toBe(false)
  })

  it('selects only from owner-injected adapters', () => {
    const memory = { name: 'memory' }
    const postgres = { name: 'postgres' }
    const adapters = { memory, postgres } as const

    expect(selectDpmAuthoringBackendAdapter({ env: {} }, adapters)).toBe(memory)
    expect(selectDpmAuthoringBackendAdapter({
      env: { [DPM_AUTHORING_BACKEND_ENV]: 'postgres' },
    }, adapters)).toBe(postgres)
    expect(selectDpmAuthoringBackendAdapter({ backend: 'memory' }, adapters)).toBe(memory)
  })

  it('wires the configured async service to the selected injected adapter', async () => {
    const memory = createRecordingAsyncRepository()
    const postgres = createRecordingAsyncRepository()
    const service = createDpmConfiguredAsyncAuthoringService({
      backend: { env: { [DPM_AUTHORING_BACKEND_ENV]: 'postgres' } },
      repositories: { memory: memory.repository, postgres: postgres.repository },
      clock: () => '2026-07-15T00:00:00.000Z',
    })

    const actor: DpmAuthoringActor = { id: 'publisher', roles: ['publisher'] }
    const revision = await service.seedPublishedRevision({
      actor,
      definitionId: 'configured-definition',
      revisionId: 'revision-1',
      definitions: createDpmIdentityDataDefinitions({ version: '1.1', fields: [], apiBindings: [] }),
    })

    expect(revision.revisionId).toBe('revision-1')
    expect(memory.publishedWrites).toHaveLength(0)
    expect(postgres.publishedWrites).toHaveLength(1)
  })
})

function createRecordingAsyncRepository(): {
  repository: DpmAsyncAuthoringRepository
  publishedWrites: DpmAuthoringPublishedRevision[]
} {
  const revisions = new Map<string, DpmAuthoringPublishedRevision>()
  const drafts = new Map<string, DpmAuthoringDraft>()
  const auditEvents = new Map<string, DpmAuthoringAuditEvent[]>()
  const publishedWrites: DpmAuthoringPublishedRevision[] = []
  const revisionKey = (definitionId: string, revisionId: string) => `${definitionId}:${revisionId}`
  const draftKey = (definitionId: string, draftId: string) => `${definitionId}:${draftId}`

  const repository: DpmAsyncAuthoringRepository = {
    async putPublishedRevision(revision) {
      publishedWrites.push(revision)
      revisions.set(revisionKey(revision.definitionId, revision.revisionId), revision)
    },
    async getPublishedRevision(definitionId, revisionId) {
      return revisions.get(revisionKey(definitionId, revisionId))
    },
    async getLatestPublishedRevision(definitionId) {
      return [...revisions.values()]
        .filter(revision => revision.definitionId === definitionId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]
    },
    async listPublishedRevisions(definitionId) {
      return [...revisions.values()].filter(revision => revision.definitionId === definitionId)
    },
    async putDraft(draft) {
      drafts.set(draftKey(draft.definitionId, draft.draftId), draft)
    },
    async getDraft(definitionId, draftId) {
      return drafts.get(draftKey(definitionId, draftId))
    },
    async appendAuditEvent(event) {
      const events = auditEvents.get(event.definitionId) ?? []
      events.push(event)
      auditEvents.set(event.definitionId, events)
    },
    async listAuditEvents(definitionId) {
      return auditEvents.get(definitionId) ?? []
    },
    async lookupIdentity(_input): Promise<readonly DpmAuthoringIdentityIndexRow[]> {
      return []
    },
  }

  return { repository, publishedWrites }
}
