import { randomUUID } from 'node:crypto'

import { createDpmIdentityDataDefinitions } from '../model/data-identity-normalize.js'
import type {
  DpmIdentityDataDefinitions,
  DpmIdentityDataDefinitionsInput,
} from '../model/data-identity-types.js'
import { createDpmAuthoringSemanticDiff } from './diff.js'
import type {
  DpmAuthoringActor,
  DpmAuthoringAuthorizationPolicy,
  DpmAuthoringAuditAction,
  DpmAuthoringAuditEvent,
  DpmAuthoringDraft,
  DpmAuthoringIdGenerator,
  DpmAuthoringLookup,
  DpmAuthoringLookupMatch,
  DpmAuthoringPublishedRevision,
  DpmAuthoringRepository,
  DpmAuthoringService,
  DpmAuthoringServiceOptions,
  DpmAuthoringSource,
  DpmAuthoringRole,
} from './types.js'
import { DpmAuthoringError } from './types.js'

export function createDpmAuthoringService(options: DpmAuthoringServiceOptions): DpmAuthoringService {
  const clock = options.clock ?? (() => new Date().toISOString())
  const idGenerator = options.idGenerator ?? defaultIdGenerator
  const repository = options.repository
  const authorization = options.authorization ?? defaultAuthorization

  return {
    seedPublishedRevision(input) {
      requireRole(authorization, input.actor, 'publisher')
      const definitions = normalizeDefinitions(input.definitions)
      const revision: DpmAuthoringPublishedRevision = {
        definitionId: requireNonEmpty(input.definitionId, 'definitionId'),
        revisionId: requireNonEmpty(input.revisionId, 'revisionId'),
        definitions,
        reason: 'initial',
        createdBy: requireNonEmpty(input.actor.id, 'actor.id'),
        createdAt: clock(),
        ...(input.source === undefined ? {} : { source: copySource(input.source) }),
      }
      repository.putPublishedRevision(revision)
      appendAudit('revision.seeded', input.actor, revision.definitionId, {
        revisionId: revision.revisionId,
      })
      return requireRevision(repository.getPublishedRevision(revision.definitionId, revision.revisionId), revision.revisionId)
    },
    getPublishedRevision(input) {
      requireAnyRole(authorization, input.actor)
      const revision = input.revisionId
        ? repository.getPublishedRevision(input.definitionId, input.revisionId)
        : repository.getLatestPublishedRevision(input.definitionId)
      return revision
    },
    lookup(input) {
      requireAnyRole(authorization, input.actor)
      const revisions = input.definitionId
        ? [repository.getLatestPublishedRevision(input.definitionId)].filter(isRevision)
        : []
      return revisions
        .flatMap(revision => lookupRevision(revision, input.query))
        .sort((left, right) => {
          const byDefinition = left.definitionId.localeCompare(right.definitionId)
          const byObject = left.field.objectId.localeCompare(right.field.objectId)
          return byDefinition || byObject || left.revisionId.localeCompare(right.revisionId)
        })
    },
    createDraft(input) {
      requireRole(authorization, input.actor, 'editor')
      const base = requireLatestRevision(repository, input.definitionId)
      if (base.revisionId !== input.baseRevisionId) {
        throw new DpmAuthoringError(
          'conflict',
          `stale base revision ${input.baseRevisionId}; current revision is ${base.revisionId}`,
        )
      }
      const draft: DpmAuthoringDraft = {
        definitionId: requireNonEmpty(input.definitionId, 'definitionId'),
        draftId: idGenerator('draft', input.definitionId),
        baseRevisionId: input.baseRevisionId,
        definitions: normalizeDefinitions(input.definitions),
        status: 'draft',
        createdBy: requireNonEmpty(input.actor.id, 'actor.id'),
        createdAt: clock(),
        ...(input.source === undefined && base.source === undefined
          ? {}
          : { source: copySource(input.source ?? base.source!) }),
      }
      repository.putDraft(draft)
      appendAudit('draft.created', input.actor, draft.definitionId, {
        draftId: draft.draftId,
        baseRevisionId: draft.baseRevisionId,
      })
      return requireDraft(repository.getDraft(draft.definitionId, draft.draftId), draft.draftId)
    },
    previewDraft(input) {
      requireAnyRole(authorization, input.actor)
      const draft = requireDraft(repository.getDraft(input.definitionId, input.draftId), input.draftId)
      const base = requireRevision(
        repository.getPublishedRevision(input.definitionId, draft.baseRevisionId),
        draft.baseRevisionId,
      )
      return createDpmAuthoringSemanticDiff(base, draft)
    },
    submitDraft(input) {
      requireRole(authorization, input.actor, 'reviewer')
      const draft = requireDraft(repository.getDraft(input.definitionId, input.draftId), input.draftId)
      if (draft.status !== 'draft') {
        throw new DpmAuthoringError('conflict', `draft ${draft.draftId} is already submitted`)
      }
      const diff = previewDraftFor(repository, input.definitionId, draft)
      const submitted: DpmAuthoringDraft = {
        ...draft,
        status: 'pending-approval',
        reviewedBy: requireNonEmpty(input.actor.id, 'actor.id'),
        reviewedAt: clock(),
      }
      repository.putDraft(submitted)
      appendAudit('draft.submitted', input.actor, submitted.definitionId, {
        draftId: submitted.draftId,
        baseRevisionId: submitted.baseRevisionId,
        breaking: diff.breaking,
      })
      return requireDraft(repository.getDraft(submitted.definitionId, submitted.draftId), submitted.draftId)
    },
    publishDraft(input) {
      requireRole(authorization, input.actor, 'publisher')
      const draft = requireDraft(repository.getDraft(input.definitionId, input.draftId), input.draftId)
      if (draft.status !== 'pending-approval') {
        throw new DpmAuthoringError('conflict', `draft ${draft.draftId} is not pending approval`)
      }
      const current = requireLatestRevision(repository, input.definitionId)
      if (current.revisionId !== draft.baseRevisionId) {
        throw new DpmAuthoringError(
          'conflict',
          `stale draft base ${draft.baseRevisionId}; current revision is ${current.revisionId}`,
        )
      }
      const diff = createDpmAuthoringSemanticDiff(current, draft)
      const revision: DpmAuthoringPublishedRevision = {
        definitionId: input.definitionId,
        revisionId: idGenerator('revision', input.definitionId),
        definitions: normalizeDefinitions(draft.definitions),
        reason: 'publish',
        createdBy: requireNonEmpty(input.actor.id, 'actor.id'),
        createdAt: clock(),
        parentRevisionId: current.revisionId,
        ...(draft.source === undefined ? {} : { source: copySource(draft.source) }),
      }
      repository.putPublishedRevision(revision)
      appendAudit('revision.published', input.actor, revision.definitionId, {
        draftId: draft.draftId,
        revisionId: revision.revisionId,
        baseRevisionId: current.revisionId,
        breaking: diff.breaking,
      })
      return requireRevision(repository.getPublishedRevision(revision.definitionId, revision.revisionId), revision.revisionId)
    },
    rollback(input) {
      requireRole(authorization, input.actor, 'rollback')
      const current = requireLatestRevision(repository, input.definitionId)
      const target = requireRevision(
        repository.getPublishedRevision(input.definitionId, input.targetRevisionId),
        input.targetRevisionId,
      )
      if (current.revisionId === target.revisionId) {
        throw new DpmAuthoringError('conflict', `revision ${target.revisionId} is already current`)
      }
      const revision: DpmAuthoringPublishedRevision = {
        definitionId: input.definitionId,
        revisionId: idGenerator('revision', input.definitionId),
        definitions: normalizeDefinitions(target.definitions),
        reason: 'rollback',
        createdBy: requireNonEmpty(input.actor.id, 'actor.id'),
        createdAt: clock(),
        parentRevisionId: current.revisionId,
        rollbackTargetRevisionId: target.revisionId,
        ...(target.source === undefined ? {} : { source: copySource(target.source) }),
      }
      repository.putPublishedRevision(revision)
      appendAudit('revision.rolled_back', input.actor, revision.definitionId, {
        revisionId: revision.revisionId,
        baseRevisionId: current.revisionId,
        targetRevisionId: target.revisionId,
      })
      return requireRevision(repository.getPublishedRevision(revision.definitionId, revision.revisionId), revision.revisionId)
    },
    listAuditEvents(input) {
      requireAnyRole(authorization, input.actor)
      return repository.listAuditEvents(input.definitionId)
    },
  }

  function appendAudit(
    action: DpmAuthoringAuditAction,
    actor: DpmAuthoringActor,
    definitionId: string,
    fields: {
      draftId?: string
      revisionId?: string
      baseRevisionId?: string
      targetRevisionId?: string
      breaking?: boolean
    },
  ): void {
    const event: DpmAuthoringAuditEvent = {
      eventId: idGenerator('audit', definitionId),
      action,
      definitionId,
      actorId: requireNonEmpty(actor.id, 'actor.id'),
      at: clock(),
      ...(fields.draftId === undefined ? {} : { draftId: fields.draftId }),
      ...(fields.revisionId === undefined ? {} : { revisionId: fields.revisionId }),
      ...(fields.baseRevisionId === undefined ? {} : { baseRevisionId: fields.baseRevisionId }),
      ...(fields.targetRevisionId === undefined ? {} : { targetRevisionId: fields.targetRevisionId }),
      ...(fields.breaking === undefined ? {} : { breaking: fields.breaking }),
    }
    repository.appendAuditEvent(event)
  }
}

function lookupRevision(
  revision: DpmAuthoringPublishedRevision,
  query: DpmAuthoringLookup,
): DpmAuthoringLookupMatch[] {
  const bindingsByObjectId = new Map<string, DpmAuthoringPublishedRevision['definitions']['apiBindings']>()
  for (const binding of revision.definitions.apiBindings) {
    const bindings = bindingsByObjectId.get(binding.dataField.objectId) ?? []
    bindingsByObjectId.set(binding.dataField.objectId, [...bindings, binding])
  }
  return revision.definitions.fields
    .filter(field => matchesQuery(field, revision.definitions.apiBindings, query))
    .map(field => ({
      definitionId: revision.definitionId,
      revisionId: revision.revisionId,
      field,
      bindings: bindingsByObjectId.get(field.objectId) ?? [],
    }))
}

function matchesQuery(
  field: DpmAuthoringPublishedRevision['definitions']['fields'][number],
  bindings: DpmAuthoringPublishedRevision['definitions']['apiBindings'],
  query: DpmAuthoringLookup,
): boolean {
  if ('objectId' in query) return field.objectId === query.objectId
  if ('db' in query) {
    const storage = field.storageRef
    return Boolean(
      storage &&
        storage.table === query.db.table &&
        storage.column === query.db.column &&
        storage.catalog.snapshotId === query.db.snapshotId &&
        storage.catalog.versionHash === query.db.versionHash,
    )
  }
  return bindings.some(binding => {
    const api = binding.api
    return api.artifactId === query.api.artifactId &&
      api.pointer === query.api.pointer &&
      api.versionHash === query.api.versionHash &&
      (query.api.operationId === undefined || api.operationId === query.api.operationId)
  })
}

function previewDraftFor(
  repository: DpmAuthoringRepository,
  definitionId: string,
  draft: DpmAuthoringDraft,
) {
  const base = requireRevision(repository.getPublishedRevision(definitionId, draft.baseRevisionId), draft.baseRevisionId)
  return createDpmAuthoringSemanticDiff(base, draft)
}

export function normalizeDefinitions(definitions: DpmIdentityDataDefinitions): DpmIdentityDataDefinitions {
  const input: DpmIdentityDataDefinitionsInput = {
    version: '1.1',
    fields: definitions.fields.map(field => ({
      objectId: field.objectId,
      revisionId: field.revisionId,
      entity: { ...field.entity },
      name: field.name,
      type: field.type,
      origin: field.origin,
      ...(field.nullable === undefined ? {} : { nullable: field.nullable }),
      ...(field.description === undefined ? {} : { description: field.description }),
      ...(field.storageRef === undefined ? {} : { storageRef: copyStorageRef(field.storageRef) }),
      ...(field.lifecycle === undefined ? {} : { lifecycle: field.lifecycle }),
      ...(field.aliases === undefined ? {} : { aliases: [...field.aliases] }),
      ...(field.supersededByObjectId === undefined ? {} : { supersededByObjectId: field.supersededByObjectId }),
    })),
    apiBindings: definitions.apiBindings.map(binding => ({
      bindingId: binding.bindingId,
      dataField: { ...binding.dataField },
      api: {
        ...binding.api,
        ...(binding.api.operationId === undefined ? {} : { operationId: binding.api.operationId }),
      },
      direction: binding.direction,
    })),
  }
  return createDpmIdentityDataDefinitions(input)
}

function copyStorageRef(storageRef: NonNullable<DpmIdentityDataDefinitions['fields'][number]['storageRef']>) {
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

export function copySource(source: DpmAuthoringSource): DpmAuthoringSource {
  return {
    artifactIdentity: source.artifactIdentity,
    freshnessIdentity: source.freshnessIdentity,
    ...(source.provenanceIdentity === undefined ? {} : { provenanceIdentity: source.provenanceIdentity }),
  }
}

function requireRole(policy: DpmAuthoringAuthorizationPolicy, actor: DpmAuthoringActor, role: DpmAuthoringRole): void {
  if (!policy.isAllowed(actor, role)) {
    throw new DpmAuthoringError('forbidden', `actor ${actor.id} requires role ${role}`)
  }
}

function requireAnyRole(policy: DpmAuthoringAuthorizationPolicy, actor: DpmAuthoringActor): void {
  if (!actor.roles.some(role => policy.isAllowed(actor, role))) {
    throw new DpmAuthoringError('forbidden', `actor ${actor.id} has no authoring role`)
  }
}

function requireLatestRevision(repository: DpmAuthoringRepository, definitionId: string): DpmAuthoringPublishedRevision {
  return requireRevision(repository.getLatestPublishedRevision(definitionId), definitionId)
}

function requireRevision(
  revision: DpmAuthoringPublishedRevision | undefined,
  revisionId: string,
): DpmAuthoringPublishedRevision {
  if (!revision) throw new DpmAuthoringError('not-found', `published revision not found: ${revisionId}`)
  return revision
}

function requireDraft(draft: DpmAuthoringDraft | undefined, draftId: string): DpmAuthoringDraft {
  if (!draft) throw new DpmAuthoringError('not-found', `draft not found: ${draftId}`)
  return draft
}

function requireNonEmpty(value: string, label: string): string {
  if (value.length === 0) throw new DpmAuthoringError('invalid', `${label} must be non-empty`)
  return value
}

function isRevision(value: DpmAuthoringPublishedRevision | undefined): value is DpmAuthoringPublishedRevision {
  return value !== undefined
}

const defaultIdGenerator: DpmAuthoringIdGenerator = (kind, definitionId) => `${kind}:${definitionId}:${randomUUID()}`

const defaultAuthorization: DpmAuthoringAuthorizationPolicy = {
  isAllowed: (actor, role) => actor.roles.includes(role),
}
