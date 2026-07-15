import { randomUUID } from 'node:crypto'

import {
  createDpmApiObjectCanonicalIdentity,
  createDpmDataFieldObjectIdentity,
  createDpmIdentityDatabaseColumnIdentity,
} from '../model/data-identity-normalize.js'
import { createDpmAuthoringSemanticDiff } from './diff.js'
import {
  compareDpmAuthoringLookupMatches,
  lookupDpmAuthoringRevision,
  matchesDpmAuthoringLookup,
} from './query.js'
import { normalizeDefinitions, copySource } from './service.js'
import {
  selectDpmAuthoringBackendAdapter,
  type DpmAuthoringBackendAdapters,
  type DpmAuthoringBackendResolutionInput,
} from './backend.js'
import {
  DpmAuthoringError,
  type DpmAsyncAuthoringRepository,
  type DpmAsyncAuthoringAuthorizationPolicy,
  type DpmAsyncAuthoringService,
  type DpmAsyncAuthoringServiceOptions,
  type DpmAuthoringActor,
  type DpmAuthoringAuditAction,
  type DpmAuthoringAuditEvent,
  type DpmAuthoringDraft,
  type DpmAuthoringIdGenerator,
  type DpmAuthoringLookup,
  type DpmAuthoringLookupMatch,
  type DpmAuthoringPublishedRevision,
} from './types.js'

export type DpmConfiguredAsyncAuthoringServiceOptions =
  Omit<DpmAsyncAuthoringServiceOptions, 'repository'> & {
    backend?: DpmAuthoringBackendResolutionInput
    repositories: DpmAuthoringBackendAdapters<DpmAsyncAuthoringRepository>
  }

export function createDpmConfiguredAsyncAuthoringService(
  options: DpmConfiguredAsyncAuthoringServiceOptions,
): DpmAsyncAuthoringService {
  const { backend, repositories, ...serviceOptions } = options
  return createDpmAsyncAuthoringService({
    ...serviceOptions,
    repository: selectDpmAuthoringBackendAdapter(backend ?? {}, repositories),
  })
}

export function createDpmAsyncAuthoringService(
  options: DpmAsyncAuthoringServiceOptions,
): DpmAsyncAuthoringService {
  const clock = options.clock ?? (() => new Date().toISOString())
  const idGenerator = options.idGenerator ?? defaultIdGenerator
  const repository = options.repository
  const authorization = options.authorization ?? defaultAuthorization

  return {
    async seedPublishedRevision(input) {
      await requireRole(authorization, input.actor, 'publisher')
      const revision: DpmAuthoringPublishedRevision = {
        definitionId: requireNonEmpty(input.definitionId, 'definitionId'),
        revisionId: requireNonEmpty(input.revisionId, 'revisionId'),
        definitions: normalizeDefinitions(input.definitions),
        reason: 'initial',
        createdBy: requireNonEmpty(input.actor.id, 'actor.id'),
        createdAt: clock(),
        ...(input.source === undefined ? {} : { source: copySource(input.source) }),
      }
      await repository.putPublishedRevision(revision)
      await appendAudit('revision.seeded', input.actor, revision.definitionId, {
        revisionId: revision.revisionId,
      })
      return requireRevision(
        await repository.getPublishedRevision(revision.definitionId, revision.revisionId),
        revision.revisionId,
      )
    },
    async getPublishedRevision(input) {
      await requireAnyRole(authorization, input.actor)
      return input.revisionId
        ? repository.getPublishedRevision(input.definitionId, input.revisionId)
        : repository.getLatestPublishedRevision(input.definitionId)
    },
    async lookup(input) {
      await requireAnyRole(authorization, input.actor)
      const indexQuery = identityIndexQuery(input.query)
      if (!indexQuery) {
        const revision = await repository.getLatestPublishedRevision(input.definitionId)
        return revision
          ? lookupDpmAuthoringRevision(revision, input.query).sort(compareDpmAuthoringLookupMatches)
          : []
      }
      const rows = await repository.lookupIdentity(indexQuery)
      const matches: DpmAuthoringLookupMatch[] = []
      for (const row of rows) {
        const revision = await repository.getPublishedRevision(row.definitionId, row.revisionId)
        if (!revision) continue
        const field = revision.definitions.fields.find(candidate => candidate.objectId === row.objectId)
        if (!field || !matchesDpmAuthoringLookup(field, revision.definitions.apiBindings, input.query)) continue
        matches.push({
          definitionId: revision.definitionId,
          revisionId: revision.revisionId,
          field,
          bindings: revision.definitions.apiBindings.filter(binding => binding.dataField.objectId === field.objectId),
        })
      }
      return matches.sort(compareDpmAuthoringLookupMatches)
    },
    async createDraft(input) {
      await requireRole(authorization, input.actor, 'editor')
      const base = await requireLatestRevision(repository, input.definitionId)
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
      await repository.putDraft(draft)
      await appendAudit('draft.created', input.actor, draft.definitionId, {
        draftId: draft.draftId,
        baseRevisionId: draft.baseRevisionId,
      })
      return requireDraft(await repository.getDraft(draft.definitionId, draft.draftId), draft.draftId)
    },
    async previewDraft(input) {
      await requireAnyRole(authorization, input.actor)
      const draft = requireDraft(await repository.getDraft(input.definitionId, input.draftId), input.draftId)
      const base = requireRevision(
        await repository.getPublishedRevision(input.definitionId, draft.baseRevisionId),
        draft.baseRevisionId,
      )
      return createDpmAuthoringSemanticDiff(base, draft)
    },
    async submitDraft(input) {
      await requireRole(authorization, input.actor, 'reviewer')
      const draft = requireDraft(await repository.getDraft(input.definitionId, input.draftId), input.draftId)
      if (draft.status !== 'draft') {
        throw new DpmAuthoringError('conflict', `draft ${draft.draftId} is already submitted`)
      }
      const diff = await previewDraftFor(repository, input.definitionId, draft)
      const submitted: DpmAuthoringDraft = {
        ...draft,
        status: 'pending-approval',
        reviewedBy: requireNonEmpty(input.actor.id, 'actor.id'),
        reviewedAt: clock(),
      }
      await repository.putDraft(submitted)
      await appendAudit('draft.submitted', input.actor, submitted.definitionId, {
        draftId: submitted.draftId,
        baseRevisionId: submitted.baseRevisionId,
        breaking: diff.breaking,
      })
      return requireDraft(await repository.getDraft(submitted.definitionId, submitted.draftId), submitted.draftId)
    },
    async publishDraft(input) {
      await requireRole(authorization, input.actor, 'publisher')
      const draft = requireDraft(await repository.getDraft(input.definitionId, input.draftId), input.draftId)
      if (draft.status !== 'pending-approval') {
        throw new DpmAuthoringError('conflict', `draft ${draft.draftId} is not pending approval`)
      }
      const current = await requireLatestRevision(repository, input.definitionId)
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
      await repository.putPublishedRevision(revision)
      await appendAudit('revision.published', input.actor, revision.definitionId, {
        draftId: draft.draftId,
        revisionId: revision.revisionId,
        baseRevisionId: current.revisionId,
        breaking: diff.breaking,
      })
      return requireRevision(
        await repository.getPublishedRevision(revision.definitionId, revision.revisionId),
        revision.revisionId,
      )
    },
    async rollback(input) {
      await requireRole(authorization, input.actor, 'rollback')
      const current = await requireLatestRevision(repository, input.definitionId)
      const target = requireRevision(
        await repository.getPublishedRevision(input.definitionId, input.targetRevisionId),
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
      await repository.putPublishedRevision(revision)
      await appendAudit('revision.rolled_back', input.actor, revision.definitionId, {
        revisionId: revision.revisionId,
        baseRevisionId: current.revisionId,
        targetRevisionId: target.revisionId,
      })
      return requireRevision(
        await repository.getPublishedRevision(revision.definitionId, revision.revisionId),
        revision.revisionId,
      )
    },
    async listAuditEvents(input) {
      await requireAnyRole(authorization, input.actor)
      return repository.listAuditEvents(input.definitionId)
    },
  }

  async function appendAudit(
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
  ): Promise<void> {
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
    await repository.appendAuditEvent(event)
  }
}

function identityIndexQuery(query: DpmAuthoringLookup): {
  identityKind: 'object' | 'api' | 'db'
  identityKey: string
} | undefined {
  if ('objectId' in query) {
    return { identityKind: 'object', identityKey: createDpmDataFieldObjectIdentity(query.objectId) }
  }
  if ('api' in query) {
    return { identityKind: 'api', identityKey: createDpmApiObjectCanonicalIdentity(query.api) }
  }
  if ('field' in query) return undefined
  return {
    identityKind: 'db',
    identityKey: createDpmIdentityDatabaseColumnIdentity({
      table: query.db.table,
      column: query.db.column,
      catalog: {
        snapshotId: query.db.snapshotId,
        versionHash: query.db.versionHash,
      },
    }),
  }
}

async function previewDraftFor(
  repository: DpmAsyncAuthoringRepository,
  definitionId: string,
  draft: DpmAuthoringDraft,
) {
  const base = requireRevision(
    await repository.getPublishedRevision(definitionId, draft.baseRevisionId),
    draft.baseRevisionId,
  )
  return createDpmAuthoringSemanticDiff(base, draft)
}

async function requireLatestRevision(
  repository: DpmAsyncAuthoringRepository,
  definitionId: string,
): Promise<DpmAuthoringPublishedRevision> {
  return requireRevision(await repository.getLatestPublishedRevision(definitionId), definitionId)
}

async function requireRole(
  policy: DpmAsyncAuthoringAuthorizationPolicy,
  actor: DpmAuthoringActor,
  role: 'editor' | 'reviewer' | 'publisher' | 'rollback',
): Promise<void> {
  if (!await policy.isAllowed(actor, role)) {
    throw new DpmAuthoringError('forbidden', `actor ${actor.id} requires role ${role}`)
  }
}

async function requireAnyRole(
  policy: DpmAsyncAuthoringAuthorizationPolicy,
  actor: DpmAuthoringActor,
): Promise<void> {
  const allowed = await Promise.all(actor.roles.map(role => policy.isAllowed(actor, role)))
  if (!allowed.some(Boolean)) {
    throw new DpmAuthoringError('forbidden', `actor ${actor.id} has no authoring role`)
  }
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

const defaultIdGenerator: DpmAuthoringIdGenerator = (kind, definitionId) => `${kind}:${definitionId}:${randomUUID()}`

const defaultAuthorization: DpmAsyncAuthoringAuthorizationPolicy = {
  isAllowed: (actor, role) => actor.roles.includes(role),
}
