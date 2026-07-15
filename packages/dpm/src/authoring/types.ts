import type {
  DpmIdentityApiBinding,
  DpmIdentityApiObjectRef,
  DpmIdentityDataDefinitions,
  DpmIdentityDataFieldDeclaration,
  DpmIdentityDatabaseColumnRef,
} from '../model/data-identity-types.js'

export type DpmAuthoringRole = 'editor' | 'reviewer' | 'publisher' | 'rollback'

export type DpmAuthoringActor = {
  id: string
  roles: readonly DpmAuthoringRole[]
}

export type DpmAuthoringSource = {
  artifactIdentity: string
  freshnessIdentity: string
  provenanceIdentity?: string
}

export type DpmAuthoringRevisionReason = 'initial' | 'publish' | 'rollback'

export type DpmAuthoringPublishedRevision = {
  definitionId: string
  revisionId: string
  definitions: DpmIdentityDataDefinitions
  reason: DpmAuthoringRevisionReason
  createdBy: string
  createdAt: string
  parentRevisionId?: string
  rollbackTargetRevisionId?: string
  source?: DpmAuthoringSource
}

export type DpmAuthoringDraftStatus = 'draft' | 'pending-approval'

export type DpmAuthoringDraft = {
  definitionId: string
  draftId: string
  baseRevisionId: string
  definitions: DpmIdentityDataDefinitions
  status: DpmAuthoringDraftStatus
  createdBy: string
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  source?: DpmAuthoringSource
}

export type DpmAuthoringAuditAction =
  | 'revision.seeded'
  | 'draft.created'
  | 'draft.submitted'
  | 'revision.published'
  | 'revision.rolled_back'

export type DpmAuthoringAuditEvent = {
  eventId: string
  action: DpmAuthoringAuditAction
  definitionId: string
  actorId: string
  at: string
  draftId?: string
  revisionId?: string
  baseRevisionId?: string
  targetRevisionId?: string
  breaking?: boolean
}

export type DpmAuthoringLookup =
  | { objectId: string }
  | { api: Pick<DpmIdentityApiObjectRef, 'artifactId' | 'pointer' | 'versionHash'> & { operationId?: string } }
  | { db: Pick<DpmIdentityDatabaseColumnRef, 'table' | 'column'> & { snapshotId: string; versionHash: string } }

export type DpmAuthoringLookupMatch = {
  definitionId: string
  revisionId: string
  field: DpmIdentityDataFieldDeclaration
  bindings: readonly DpmIdentityApiBinding[]
}

export type DpmAuthoringIdentityIndexKind = 'object' | 'api' | 'db'

export type DpmAuthoringIdentityIndexRow = {
  definitionId: string
  revisionId: string
  identityKind: DpmAuthoringIdentityIndexKind
  identityKey: string
  objectId: string
}

export type DpmAuthoringChangeKind =
  | 'field.added'
  | 'field.removed'
  | 'field.changed'
  | 'api-binding.added'
  | 'api-binding.removed'
  | 'api-binding.changed'

export type DpmAuthoringSemanticChange = {
  kind: DpmAuthoringChangeKind
  identity: string
  breaking: boolean
  before?: unknown
  after?: unknown
}

export type DpmAuthoringSemanticDiff = {
  definitionId: string
  baseRevisionId: string
  draftId: string
  breaking: boolean
  changes: readonly DpmAuthoringSemanticChange[]
}

export type DpmAuthoringRepository = {
  putPublishedRevision(revision: DpmAuthoringPublishedRevision): void
  getPublishedRevision(definitionId: string, revisionId: string): DpmAuthoringPublishedRevision | undefined
  getLatestPublishedRevision(definitionId: string): DpmAuthoringPublishedRevision | undefined
  listPublishedRevisions(definitionId: string): readonly DpmAuthoringPublishedRevision[]
  putDraft(draft: DpmAuthoringDraft): void
  getDraft(definitionId: string, draftId: string): DpmAuthoringDraft | undefined
  appendAuditEvent(event: DpmAuthoringAuditEvent): void
  listAuditEvents(definitionId: string): readonly DpmAuthoringAuditEvent[]
}

export type DpmAuthoringIdKind = 'draft' | 'revision' | 'audit'

export type DpmAuthoringIdGenerator = (kind: DpmAuthoringIdKind, definitionId: string) => string

export type DpmAuthoringService = {
  seedPublishedRevision(input: {
    actor: DpmAuthoringActor
    definitionId: string
    revisionId: string
    definitions: DpmIdentityDataDefinitions
    source?: DpmAuthoringSource
  }): DpmAuthoringPublishedRevision
  getPublishedRevision(input: {
    actor: DpmAuthoringActor
    definitionId: string
    revisionId?: string
  }): DpmAuthoringPublishedRevision | undefined
  lookup(input: {
    actor: DpmAuthoringActor
    definitionId: string
    query: DpmAuthoringLookup
  }): readonly DpmAuthoringLookupMatch[]
  createDraft(input: {
    actor: DpmAuthoringActor
    definitionId: string
    baseRevisionId: string
    definitions: DpmIdentityDataDefinitions
    source?: DpmAuthoringSource
  }): DpmAuthoringDraft
  previewDraft(input: {
    actor: DpmAuthoringActor
    definitionId: string
    draftId: string
  }): DpmAuthoringSemanticDiff
  submitDraft(input: {
    actor: DpmAuthoringActor
    definitionId: string
    draftId: string
  }): DpmAuthoringDraft
  publishDraft(input: {
    actor: DpmAuthoringActor
    definitionId: string
    draftId: string
  }): DpmAuthoringPublishedRevision
  rollback(input: {
    actor: DpmAuthoringActor
    definitionId: string
    targetRevisionId: string
  }): DpmAuthoringPublishedRevision
  listAuditEvents(input: {
    actor: DpmAuthoringActor
    definitionId: string
  }): readonly DpmAuthoringAuditEvent[]
}

export type DpmAsyncAuthoringRepository = {
  putPublishedRevision(revision: DpmAuthoringPublishedRevision): Promise<void>
  getPublishedRevision(definitionId: string, revisionId: string): Promise<DpmAuthoringPublishedRevision | undefined>
  getLatestPublishedRevision(definitionId: string): Promise<DpmAuthoringPublishedRevision | undefined>
  listPublishedRevisions(definitionId: string): Promise<readonly DpmAuthoringPublishedRevision[]>
  putDraft(draft: DpmAuthoringDraft): Promise<void>
  getDraft(definitionId: string, draftId: string): Promise<DpmAuthoringDraft | undefined>
  appendAuditEvent(event: DpmAuthoringAuditEvent): Promise<void>
  listAuditEvents(definitionId: string): Promise<readonly DpmAuthoringAuditEvent[]>
  lookupIdentity(input: {
    identityKind: DpmAuthoringIdentityIndexKind
    identityKey: string
  }): Promise<readonly DpmAuthoringIdentityIndexRow[]>
}

export type DpmAsyncAuthoringService = {
  seedPublishedRevision(input: Parameters<DpmAuthoringService['seedPublishedRevision']>[0]): Promise<DpmAuthoringPublishedRevision>
  getPublishedRevision(input: Parameters<DpmAuthoringService['getPublishedRevision']>[0]): Promise<DpmAuthoringPublishedRevision | undefined>
  lookup(input: Parameters<DpmAuthoringService['lookup']>[0]): Promise<readonly DpmAuthoringLookupMatch[]>
  createDraft(input: Parameters<DpmAuthoringService['createDraft']>[0]): Promise<DpmAuthoringDraft>
  previewDraft(input: Parameters<DpmAuthoringService['previewDraft']>[0]): Promise<DpmAuthoringSemanticDiff>
  submitDraft(input: Parameters<DpmAuthoringService['submitDraft']>[0]): Promise<DpmAuthoringDraft>
  publishDraft(input: Parameters<DpmAuthoringService['publishDraft']>[0]): Promise<DpmAuthoringPublishedRevision>
  rollback(input: Parameters<DpmAuthoringService['rollback']>[0]): Promise<DpmAuthoringPublishedRevision>
  listAuditEvents(input: Parameters<DpmAuthoringService['listAuditEvents']>[0]): Promise<readonly DpmAuthoringAuditEvent[]>
}

export type DpmAuthoringServiceOptions = {
  repository: DpmAuthoringRepository
  clock?: () => string
  idGenerator?: DpmAuthoringIdGenerator
}

export type DpmAsyncAuthoringServiceOptions = {
  repository: DpmAsyncAuthoringRepository
  clock?: () => string
  idGenerator?: DpmAuthoringIdGenerator
}

export type DpmAuthoringErrorCode = 'forbidden' | 'not-found' | 'conflict' | 'invalid'

export class DpmAuthoringError extends Error {
  readonly code: DpmAuthoringErrorCode

  constructor(code: DpmAuthoringErrorCode, message: string) {
    super(message)
    this.name = 'DpmAuthoringError'
    this.code = code
  }
}
