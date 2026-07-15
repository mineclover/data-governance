import {
  createDpmAsyncAuthoringService,
  createDpmAuthoringIdentityIndexRows,
  createDpmIdentityDataDefinitions,
  createDpmInMemoryAuthoringRepository,
  type DpmAsyncAuthoringRepository,
  type DpmAuthoringIdKind,
  type DpmAuthoringSource,
} from '../../src/index.js'

export const DPM_AUTHORING_OPERATIONAL_MIGRATION_FIXTURE = {
  definitionId: 'customer-definition',
  initialRevisionId: 'revision-1',
  source: {
    artifactIdentity: 'dpm.data-binding-artifact:operational-rehearsal',
    freshnessIdentity: 'sha256:operational-rehearsal',
    provenanceIdentity: 'review:operational-rehearsal',
  } satisfies DpmAuthoringSource,
  initialDefinitions: createDefinitions('string'),
  breakingDefinitions: createDefinitions('number'),
} as const

export function createDpmAuthoringOperationalMigrationRehearsal() {
  const backingRepository = createDpmInMemoryAuthoringRepository()
  const counters: Record<DpmAuthoringIdKind, number> = { draft: 0, revision: 0, audit: 0 }
  let tick = 0
  const repository: DpmAsyncAuthoringRepository = {
    putPublishedRevision: async revision => backingRepository.putPublishedRevision(revision),
    getPublishedRevision: async (definitionId, revisionId) => backingRepository.getPublishedRevision(definitionId, revisionId),
    getLatestPublishedRevision: async definitionId => backingRepository.getLatestPublishedRevision(definitionId),
    listPublishedRevisions: async definitionId => backingRepository.listPublishedRevisions(definitionId),
    putDraft: async draft => backingRepository.putDraft(draft),
    getDraft: async (definitionId, draftId) => backingRepository.getDraft(definitionId, draftId),
    appendAuditEvent: async event => backingRepository.appendAuditEvent(event),
    listAuditEvents: async definitionId => backingRepository.listAuditEvents(definitionId),
    lookupIdentity: async input => {
      const revision = backingRepository.getLatestPublishedRevision(DPM_AUTHORING_OPERATIONAL_MIGRATION_FIXTURE.definitionId)
      if (!revision) return []
      return createDpmAuthoringIdentityIndexRows(revision)
        .filter(row => row.identityKind === input.identityKind && row.identityKey === input.identityKey)
    },
  }

  return {
    fixture: DPM_AUTHORING_OPERATIONAL_MIGRATION_FIXTURE,
    repository,
    service: createDpmAsyncAuthoringService({
      repository,
      clock: () => `2026-07-15T00:00:0${tick++}.000Z`,
      idGenerator: (kind, definitionId) => `${kind}:${definitionId}:${++counters[kind]}`,
    }),
  }
}

function createDefinitions(type: 'number' | 'string') {
  return createDpmIdentityDataDefinitions({
    version: '1.1',
    fields: [{
      objectId: 'customer-number',
      revisionId: 'customer-number-rev-1',
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
      dataField: { objectId: 'customer-number', revisionId: 'customer-number-rev-1' },
      api: {
        artifactId: 'commerce-api',
        versionHash: 'sha256:api-1',
        pointer: '#/components/schemas/Customer/properties/customerNo',
      },
      direction: 'response',
    }],
  })
}
