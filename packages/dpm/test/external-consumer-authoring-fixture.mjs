import assert from 'node:assert/strict'

import {
  DPM_AUTHORING_BACKEND_ENV,
  createDpmConfiguredAsyncAuthoringService,
  createDpmInMemoryAuthoringRepository,
} from '@oa-sdk/dpm/authoring'
import { createDpmIdentityDataDefinitions } from '@oa-sdk/dpm/data'

const memoryRepository = createDpmInMemoryAuthoringRepository()
const postgresRepository = createDpmInMemoryAuthoringRepository()
const service = createDpmConfiguredAsyncAuthoringService({
  backend: {
    env: { [DPM_AUTHORING_BACKEND_ENV]: 'postgres' },
  },
  repositories: {
    memory: toAsyncRepository(memoryRepository),
    postgres: toAsyncRepository(postgresRepository),
  },
  clock: () => '2026-07-15T00:00:00.000Z',
})

const revision = await service.seedPublishedRevision({
  actor: {
    id: 'external-consumer',
    roles: ['publisher'],
  },
  definitionId: 'external-authoring-definition',
  revisionId: 'revision-1',
  definitions: createDpmIdentityDataDefinitions({
    version: '1.1',
    fields: [{
      objectId: 'external-customer-number',
      revisionId: 'external-customer-number-rev-1',
      entity: {
        datasetId: 'external_fixture',
        namespace: 'customer',
        name: 'customer',
      },
      name: 'customerNo',
      type: 'string',
      origin: 'api_only',
    }],
  }),
})

assert.equal(revision.revisionId, 'revision-1')
assert.equal(memoryRepository.getPublishedRevision('external-authoring-definition', 'revision-1'), undefined)
assert.equal(
  postgresRepository.getPublishedRevision('external-authoring-definition', 'revision-1')?.revisionId,
  'revision-1',
)

console.log(JSON.stringify({
  status: 'ok',
  selectedBackend: 'postgres',
  storageEffect: 'injected-adapter-only',
  revisionId: revision.revisionId,
}))

function toAsyncRepository(repository) {
  return {
    putPublishedRevision: async revision => repository.putPublishedRevision(revision),
    getPublishedRevision: async (definitionId, revisionId) => repository.getPublishedRevision(definitionId, revisionId),
    getLatestPublishedRevision: async definitionId => repository.getLatestPublishedRevision(definitionId),
    listPublishedRevisions: async definitionId => repository.listPublishedRevisions(definitionId),
    putDraft: async draft => repository.putDraft(draft),
    getDraft: async (definitionId, draftId) => repository.getDraft(definitionId, draftId),
    appendAuditEvent: async event => repository.appendAuditEvent(event),
    listAuditEvents: async definitionId => repository.listAuditEvents(definitionId),
    lookupIdentity: async () => [],
  }
}
