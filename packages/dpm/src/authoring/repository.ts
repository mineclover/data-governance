import type {
  DpmAuthoringAuditEvent,
  DpmAuthoringDraft,
  DpmAuthoringPublishedRevision,
  DpmAuthoringRepository,
} from './types.js'

export function createDpmInMemoryAuthoringRepository(): DpmAuthoringRepository {
  const revisions = new Map<string, Map<string, DpmAuthoringPublishedRevision>>()
  const drafts = new Map<string, Map<string, DpmAuthoringDraft>>()
  const auditEvents = new Map<string, Map<string, DpmAuthoringAuditEvent>>()

  return {
    putPublishedRevision(revision) {
      const byRevision = revisions.get(revision.definitionId) ?? new Map<string, DpmAuthoringPublishedRevision>()
      if (byRevision.has(revision.revisionId)) {
        throw new Error(`published revision already exists: ${revision.definitionId}/${revision.revisionId}`)
      }
      byRevision.set(revision.revisionId, copyRevision(revision))
      revisions.set(revision.definitionId, byRevision)
    },
    getPublishedRevision(definitionId, revisionId) {
      const revision = revisions.get(definitionId)?.get(revisionId)
      return revision ? copyRevision(revision) : undefined
    },
    getLatestPublishedRevision(definitionId) {
      const revisionsForDefinition = this.listPublishedRevisions(definitionId)
      return revisionsForDefinition.at(-1)
    },
    listPublishedRevisions(definitionId) {
      const result = [...(revisions.get(definitionId)?.values() ?? [])]
        .sort((left, right) => {
          const byTime = left.createdAt.localeCompare(right.createdAt)
          return byTime || left.revisionId.localeCompare(right.revisionId)
        })
        .map(copyRevision)
      return Object.freeze(result)
    },
    putDraft(draft) {
      const byDraft = drafts.get(draft.definitionId) ?? new Map<string, DpmAuthoringDraft>()
      const existing = byDraft.get(draft.draftId)
      if (existing && (existing.baseRevisionId !== draft.baseRevisionId || existing.createdBy !== draft.createdBy)) {
        throw new Error(`draft identity cannot change: ${draft.definitionId}/${draft.draftId}`)
      }
      byDraft.set(draft.draftId, copyDraft(draft))
      drafts.set(draft.definitionId, byDraft)
    },
    getDraft(definitionId, draftId) {
      const draft = drafts.get(definitionId)?.get(draftId)
      return draft ? copyDraft(draft) : undefined
    },
    appendAuditEvent(event) {
      const byEvent = auditEvents.get(event.definitionId) ?? new Map<string, DpmAuthoringAuditEvent>()
      if (byEvent.has(event.eventId)) {
        throw new Error(`audit event already exists: ${event.definitionId}/${event.eventId}`)
      }
      byEvent.set(event.eventId, copyAuditEvent(event))
      auditEvents.set(event.definitionId, byEvent)
    },
    listAuditEvents(definitionId) {
      const result = [...(auditEvents.get(definitionId)?.values() ?? [])]
        .sort((left, right) => {
          const byTime = left.at.localeCompare(right.at)
          return byTime || left.eventId.localeCompare(right.eventId)
        })
        .map(copyAuditEvent)
      return Object.freeze(result)
    },
  }
}

function copyRevision(revision: DpmAuthoringPublishedRevision): DpmAuthoringPublishedRevision {
  return freezeDeep({
    ...revision,
    definitions: copyDefinitions(revision.definitions),
    ...(revision.parentRevisionId === undefined ? {} : { parentRevisionId: revision.parentRevisionId }),
    ...(revision.rollbackTargetRevisionId === undefined ? {} : { rollbackTargetRevisionId: revision.rollbackTargetRevisionId }),
    ...(revision.source === undefined ? {} : { source: copySource(revision.source) }),
  })
}

function copyDraft(draft: DpmAuthoringDraft): DpmAuthoringDraft {
  return freezeDeep({
    ...draft,
    definitions: copyDefinitions(draft.definitions),
    ...(draft.reviewedBy === undefined ? {} : { reviewedBy: draft.reviewedBy }),
    ...(draft.reviewedAt === undefined ? {} : { reviewedAt: draft.reviewedAt }),
    ...(draft.source === undefined ? {} : { source: copySource(draft.source) }),
  })
}

function copyAuditEvent(event: DpmAuthoringAuditEvent): DpmAuthoringAuditEvent {
  return freezeDeep({
    ...event,
    ...(event.draftId === undefined ? {} : { draftId: event.draftId }),
    ...(event.revisionId === undefined ? {} : { revisionId: event.revisionId }),
    ...(event.baseRevisionId === undefined ? {} : { baseRevisionId: event.baseRevisionId }),
    ...(event.targetRevisionId === undefined ? {} : { targetRevisionId: event.targetRevisionId }),
    ...(event.breaking === undefined ? {} : { breaking: event.breaking }),
  })
}

function copySource(source: NonNullable<DpmAuthoringPublishedRevision['source']>): NonNullable<DpmAuthoringPublishedRevision['source']> {
  return {
    artifactIdentity: source.artifactIdentity,
    freshnessIdentity: source.freshnessIdentity,
    ...(source.provenanceIdentity === undefined ? {} : { provenanceIdentity: source.provenanceIdentity }),
  }
}

function copyDefinitions(definitions: DpmAuthoringPublishedRevision['definitions']): DpmAuthoringPublishedRevision['definitions'] {
  return freezeDeep({
    version: '1.1',
    fields: definitions.fields.map(field => freezeDeep({
      ...field,
      entity: { ...field.entity },
      locator: { ...field.locator },
      ...(field.nullable === undefined ? {} : { nullable: field.nullable }),
      ...(field.description === undefined ? {} : { description: field.description }),
      ...(field.storageRef === undefined ? {} : { storageRef: copyStorageRef(field.storageRef) }),
      ...(field.lifecycle === undefined ? {} : { lifecycle: field.lifecycle }),
      ...(field.aliases === undefined ? {} : { aliases: [...field.aliases] }),
      ...(field.supersededByObjectId === undefined ? {} : { supersededByObjectId: field.supersededByObjectId }),
    })),
    apiBindings: definitions.apiBindings.map(binding => freezeDeep({
      ...binding,
      dataField: { ...binding.dataField },
      api: {
        ...binding.api,
        ...(binding.api.operationId === undefined ? {} : { operationId: binding.api.operationId }),
      },
    })),
  })
}

function copyStorageRef(storageRef: NonNullable<DpmAuthoringPublishedRevision['definitions']['fields'][number]['storageRef']>) {
  return {
    table: storageRef.table,
    column: storageRef.column,
    catalog: {
      ...storageRef.catalog,
      ...(storageRef.catalog.sourceCoordinate === undefined
        ? {}
        : { sourceCoordinate: { ...storageRef.catalog.sourceCoordinate } }),
    },
  }
}

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}
