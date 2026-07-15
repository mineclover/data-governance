import {
  createDpmApiObjectCanonicalIdentity,
  createDpmIdentityDataDefinitions,
  createDpmIdentityDatabaseColumnIdentity,
} from '../model/data-identity-normalize.js'
import type {
  DpmIdentityDataDefinitions,
  DpmIdentityDataDefinitionsInput,
} from '../model/data-identity-types.js'
import type {
  DpmAuthoringAuditEvent,
  DpmAuthoringDraft,
  DpmAuthoringIdentityIndexKind,
  DpmAuthoringIdentityIndexRow,
  DpmAuthoringPublishedRevision,
  DpmAuthoringSource,
} from './types.js'

type QueryResult<T> = readonly T[] | { rows: readonly T[] }

export type DpmPostgresAuthoringQueryClient = {
  query<T>(sql: string, parameters: readonly unknown[]): Promise<QueryResult<T>>
}

export type DpmPostgresAuthoringClient = DpmPostgresAuthoringQueryClient & {
  transaction<T>(operation: (client: DpmPostgresAuthoringQueryClient) => Promise<T>): Promise<T>
}

export type DpmPostgresAuthoringStorage = {
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

export const DPM_AUTHORING_STORAGE_SCHEMA_VERSION = '1.0' as const

export const DPM_AUTHORING_STORAGE_SCHEMA_SQL_BLOCKS = [
  `create schema if not exists dpm;

create table if not exists dpm.authoring_published_revisions (
  definition_id text not null,
  revision_id text not null,
  reason text not null check (reason in ('initial', 'publish', 'rollback')),
  definitions jsonb not null,
  source jsonb,
  created_by text not null,
  created_at timestamptz not null,
  parent_revision_id text,
  rollback_target_revision_id text,
  primary key (definition_id, revision_id)
);`,
  `create table if not exists dpm.authoring_drafts (
  definition_id text not null,
  draft_id text not null,
  base_revision_id text not null,
  definitions jsonb not null,
  status text not null check (status in ('draft', 'pending-approval')),
  source jsonb,
  created_by text not null,
  created_at timestamptz not null,
  reviewed_by text,
  reviewed_at timestamptz,
  primary key (definition_id, draft_id)
);`,
  `create table if not exists dpm.authoring_audit_events (
  event_id text primary key,
  action text not null check (action in (
    'revision.seeded',
    'draft.created',
    'draft.submitted',
    'revision.published',
    'revision.rolled_back'
  )),
  definition_id text not null,
  actor_id text not null,
  at timestamptz not null,
  draft_id text,
  revision_id text,
  base_revision_id text,
  target_revision_id text,
  breaking boolean
);`,
  `create table if not exists dpm.authoring_identity_index (
  definition_id text not null,
  revision_id text not null,
  identity_kind text not null check (identity_kind in ('object', 'api', 'db')),
  identity_key text not null,
  object_id text not null,
  primary key (definition_id, revision_id, identity_kind, identity_key),
  foreign key (definition_id, revision_id)
    references dpm.authoring_published_revisions (definition_id, revision_id)
    on delete cascade
);`,
  `create index if not exists dpm_authoring_published_latest_idx
  on dpm.authoring_published_revisions (definition_id, created_at desc, revision_id desc);

create index if not exists dpm_authoring_identity_lookup_idx
  on dpm.authoring_identity_index (identity_kind, identity_key, definition_id, revision_id);

create index if not exists dpm_authoring_audit_lookup_idx
  on dpm.authoring_audit_events (definition_id, at, event_id);`,
] as const

const INSERT_PUBLISHED_REVISION_SQL = `insert into dpm.authoring_published_revisions (
  definition_id,
  revision_id,
  reason,
  definitions,
  source,
  created_by,
  created_at,
  parent_revision_id,
  rollback_target_revision_id
) values ($1, $2, $3, $4::jsonb, $5::jsonb, $6, $7::timestamptz, $8, $9)`

const INSERT_IDENTITY_INDEX_SQL = `insert into dpm.authoring_identity_index (
  definition_id,
  revision_id,
  identity_kind,
  identity_key,
  object_id
) values ($1, $2, $3, $4, $5)`

export function createDpmPostgresAuthoringStorage(
  client: DpmPostgresAuthoringClient,
): DpmPostgresAuthoringStorage {
  return {
    async putPublishedRevision(revision) {
      await client.transaction(async transaction => {
        await transaction.query(INSERT_PUBLISHED_REVISION_SQL, publishedRevisionParameters(revision))
        await transaction.query(
          'delete from dpm.authoring_identity_index where definition_id = $1 and revision_id = $2',
          [revision.definitionId, revision.revisionId],
        )
        for (const row of createDpmAuthoringIdentityIndexRows(revision)) {
          await transaction.query(INSERT_IDENTITY_INDEX_SQL, [
            row.definitionId,
            row.revisionId,
            row.identityKind,
            row.identityKey,
            row.objectId,
          ])
        }
      })
    },
    async getPublishedRevision(definitionId, revisionId) {
      const result = await client.query<DpmPostgresAuthoringPublishedRevisionDbRow>(
        `${PUBLISHED_REVISION_SELECT_SQL} where definition_id = $1 and revision_id = $2`,
        [definitionId, revisionId],
      )
      const row = rowsFromQueryResult(result)[0]
      return row ? postgresPublishedRevisionToSdk(row) : undefined
    },
    async getLatestPublishedRevision(definitionId) {
      const result = await client.query<DpmPostgresAuthoringPublishedRevisionDbRow>(
        `${PUBLISHED_REVISION_SELECT_SQL} where definition_id = $1 order by created_at desc, revision_id desc limit 1`,
        [definitionId],
      )
      const row = rowsFromQueryResult(result)[0]
      return row ? postgresPublishedRevisionToSdk(row) : undefined
    },
    async listPublishedRevisions(definitionId) {
      const result = await client.query<DpmPostgresAuthoringPublishedRevisionDbRow>(
        `${PUBLISHED_REVISION_SELECT_SQL} where definition_id = $1 order by created_at asc, revision_id asc`,
        [definitionId],
      )
      return Object.freeze(rowsFromQueryResult(result).map(postgresPublishedRevisionToSdk))
    },
    async putDraft(draft) {
      const result = await client.query<{ draft_id: string }>(DRAFT_UPSERT_SQL, draftParameters(draft))
      if (rowsFromQueryResult(result).length === 0) {
        throw new Error(`DPM Postgres draft base revision conflict: ${draft.definitionId}/${draft.draftId}`)
      }
    },
    async getDraft(definitionId, draftId) {
      const result = await client.query<DpmPostgresAuthoringDraftDbRow>(
        `${DRAFT_SELECT_SQL} where definition_id = $1 and draft_id = $2`,
        [definitionId, draftId],
      )
      const row = rowsFromQueryResult(result)[0]
      return row ? postgresDraftToSdk(row) : undefined
    },
    async appendAuditEvent(event) {
      const result = await client.query<{ event_id: string }>(AUDIT_INSERT_SQL, auditEventParameters(event))
      if (rowsFromQueryResult(result).length === 0) {
        throw new Error(`DPM Postgres audit append returned no row for ${event.eventId}.`)
      }
    },
    async listAuditEvents(definitionId) {
      const result = await client.query<DpmPostgresAuthoringAuditEventDbRow>(
        `${AUDIT_SELECT_SQL} where definition_id = $1 order by at asc, event_id asc`,
        [definitionId],
      )
      return Object.freeze(rowsFromQueryResult(result).map(postgresAuditEventToSdk))
    },
    async lookupIdentity(input) {
      const result = await client.query<DpmAuthoringIdentityIndexDbRow>(
        `${IDENTITY_INDEX_SELECT_SQL} where identity_kind = $1 and identity_key = $2 order by definition_id asc, revision_id asc, object_id asc`,
        [input.identityKind, input.identityKey],
      )
      return Object.freeze(rowsFromQueryResult(result).map(postgresIdentityIndexToSdk))
    },
  }
}

export function createDpmAuthoringIdentityIndexRows(
  revision: DpmAuthoringPublishedRevision,
): readonly DpmAuthoringIdentityIndexRow[] {
  const rows = new Map<string, DpmAuthoringIdentityIndexRow>()
  for (const field of revision.definitions.fields) {
    addIndexRow(rows, {
      definitionId: revision.definitionId,
      revisionId: revision.revisionId,
      identityKind: 'object',
      identityKey: field.identity,
      objectId: field.objectId,
    })
    if (field.storageRef) {
      addIndexRow(rows, {
        definitionId: revision.definitionId,
        revisionId: revision.revisionId,
        identityKind: 'db',
        identityKey: createDpmIdentityDatabaseColumnIdentity(field.storageRef),
        objectId: field.objectId,
      })
    }
  }
  for (const binding of revision.definitions.apiBindings) {
    addIndexRow(rows, {
      definitionId: revision.definitionId,
      revisionId: revision.revisionId,
      identityKind: 'api',
      identityKey: createDpmApiObjectCanonicalIdentity(binding.api),
      objectId: binding.dataField.objectId,
    })
  }
  return Object.freeze([...rows.values()].sort((left, right) => {
    const byKind = left.identityKind.localeCompare(right.identityKind)
    const byKey = left.identityKey.localeCompare(right.identityKey)
    return byKind || byKey || left.objectId.localeCompare(right.objectId)
  }))
}

type DpmPostgresAuthoringPublishedRevisionDbRow = {
  definition_id: string
  revision_id: string
  reason: DpmAuthoringPublishedRevision['reason']
  definitions: unknown
  source?: unknown | null
  created_by: string
  created_at: string | Date
  parent_revision_id?: string | null
  rollback_target_revision_id?: string | null
}

type DpmPostgresAuthoringDraftDbRow = {
  definition_id: string
  draft_id: string
  base_revision_id: string
  definitions: unknown
  status: DpmAuthoringDraft['status']
  source?: unknown | null
  created_by: string
  created_at: string | Date
  reviewed_by?: string | null
  reviewed_at?: string | Date | null
}

type DpmPostgresAuthoringAuditEventDbRow = {
  event_id: string
  action: DpmAuthoringAuditEvent['action']
  definition_id: string
  actor_id: string
  at: string | Date
  draft_id?: string | null
  revision_id?: string | null
  base_revision_id?: string | null
  target_revision_id?: string | null
  breaking?: boolean | null
}

type DpmAuthoringIdentityIndexDbRow = {
  definition_id: string
  revision_id: string
  identity_kind: DpmAuthoringIdentityIndexKind
  identity_key: string
  object_id: string
}

const PUBLISHED_REVISION_SELECT_SQL = `select
  definition_id,
  revision_id,
  reason,
  definitions,
  source,
  created_by,
  created_at,
  parent_revision_id,
  rollback_target_revision_id
from dpm.authoring_published_revisions`

const DRAFT_SELECT_SQL = `select
  definition_id,
  draft_id,
  base_revision_id,
  definitions,
  status,
  source,
  created_by,
  created_at,
  reviewed_by,
  reviewed_at
from dpm.authoring_drafts`

const DRAFT_UPSERT_SQL = `insert into dpm.authoring_drafts (
  definition_id,
  draft_id,
  base_revision_id,
  definitions,
  status,
  source,
  created_by,
  created_at,
  reviewed_by,
  reviewed_at
) values ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7, $8::timestamptz, $9, $10::timestamptz)
on conflict (definition_id, draft_id) do update set
  definitions = excluded.definitions,
  status = excluded.status,
  source = excluded.source,
  reviewed_by = excluded.reviewed_by,
  reviewed_at = excluded.reviewed_at
where dpm.authoring_drafts.base_revision_id = excluded.base_revision_id
returning draft_id`

const AUDIT_SELECT_SQL = `select
  event_id,
  action,
  definition_id,
  actor_id,
  at,
  draft_id,
  revision_id,
  base_revision_id,
  target_revision_id,
  breaking
from dpm.authoring_audit_events`

const AUDIT_INSERT_SQL = `insert into dpm.authoring_audit_events (
  event_id,
  action,
  definition_id,
  actor_id,
  at,
  draft_id,
  revision_id,
  base_revision_id,
  target_revision_id,
  breaking
) values ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, $9, $10)
returning event_id`

const IDENTITY_INDEX_SELECT_SQL = `select
  definition_id,
  revision_id,
  identity_kind,
  identity_key,
  object_id
from dpm.authoring_identity_index`

function publishedRevisionParameters(revision: DpmAuthoringPublishedRevision): readonly unknown[] {
  return [
    revision.definitionId,
    revision.revisionId,
    revision.reason,
    JSON.stringify(revision.definitions),
    revision.source ? JSON.stringify(revision.source) : null,
    revision.createdBy,
    revision.createdAt,
    revision.parentRevisionId ?? null,
    revision.rollbackTargetRevisionId ?? null,
  ]
}

function draftParameters(draft: DpmAuthoringDraft): readonly unknown[] {
  return [
    draft.definitionId,
    draft.draftId,
    draft.baseRevisionId,
    JSON.stringify(draft.definitions),
    draft.status,
    draft.source ? JSON.stringify(draft.source) : null,
    draft.createdBy,
    draft.createdAt,
    draft.reviewedBy ?? null,
    draft.reviewedAt ?? null,
  ]
}

function auditEventParameters(event: DpmAuthoringAuditEvent): readonly unknown[] {
  return [
    event.eventId,
    event.action,
    event.definitionId,
    event.actorId,
    event.at,
    event.draftId ?? null,
    event.revisionId ?? null,
    event.baseRevisionId ?? null,
    event.targetRevisionId ?? null,
    event.breaking ?? null,
  ]
}

function postgresPublishedRevisionToSdk(row: DpmPostgresAuthoringPublishedRevisionDbRow): DpmAuthoringPublishedRevision {
  return freezeDeep({
    definitionId: row.definition_id,
    revisionId: row.revision_id,
    definitions: parseDefinitions(row.definitions),
    reason: row.reason,
    createdBy: row.created_by,
    createdAt: toIsoString(row.created_at),
    ...(row.parent_revision_id ? { parentRevisionId: row.parent_revision_id } : {}),
    ...(row.rollback_target_revision_id ? { rollbackTargetRevisionId: row.rollback_target_revision_id } : {}),
    ...(row.source === undefined || row.source === null ? {} : { source: parseSource(row.source) }),
  })
}

function postgresDraftToSdk(row: DpmPostgresAuthoringDraftDbRow): DpmAuthoringDraft {
  return freezeDeep({
    definitionId: row.definition_id,
    draftId: row.draft_id,
    baseRevisionId: row.base_revision_id,
    definitions: parseDefinitions(row.definitions),
    status: row.status,
    createdBy: row.created_by,
    createdAt: toIsoString(row.created_at),
    ...(row.reviewed_by ? { reviewedBy: row.reviewed_by } : {}),
    ...(row.reviewed_at ? { reviewedAt: toIsoString(row.reviewed_at) } : {}),
    ...(row.source === undefined || row.source === null ? {} : { source: parseSource(row.source) }),
  })
}

function postgresAuditEventToSdk(row: DpmPostgresAuthoringAuditEventDbRow): DpmAuthoringAuditEvent {
  return freezeDeep({
    eventId: row.event_id,
    action: row.action,
    definitionId: row.definition_id,
    actorId: row.actor_id,
    at: toIsoString(row.at),
    ...(row.draft_id ? { draftId: row.draft_id } : {}),
    ...(row.revision_id ? { revisionId: row.revision_id } : {}),
    ...(row.base_revision_id ? { baseRevisionId: row.base_revision_id } : {}),
    ...(row.target_revision_id ? { targetRevisionId: row.target_revision_id } : {}),
    ...(row.breaking === undefined || row.breaking === null ? {} : { breaking: row.breaking }),
  })
}

function postgresIdentityIndexToSdk(row: DpmAuthoringIdentityIndexDbRow): DpmAuthoringIdentityIndexRow {
  return freezeDeep({
    definitionId: row.definition_id,
    revisionId: row.revision_id,
    identityKind: row.identity_kind,
    identityKey: row.identity_key,
    objectId: row.object_id,
  })
}

function parseDefinitions(value: unknown): DpmIdentityDataDefinitions {
  const record = parseJsonRecord(value, 'definitions')
  if (record.version !== '1.1' || !Array.isArray(record.fields)) {
    throw new Error('DPM Postgres authoring definitions must be a data_definitions v1.1 object')
  }
  const input: DpmIdentityDataDefinitionsInput = {
    version: '1.1',
    fields: record.fields as DpmIdentityDataDefinitionsInput['fields'],
    ...(Array.isArray(record.apiBindings)
      ? { apiBindings: record.apiBindings as NonNullable<DpmIdentityDataDefinitionsInput['apiBindings']> }
      : {}),
  }
  return createDpmIdentityDataDefinitions(input)
}

function parseSource(value: unknown): DpmAuthoringSource {
  const record = parseJsonRecord(value, 'source')
  if (typeof record.artifactIdentity !== 'string' || typeof record.freshnessIdentity !== 'string') {
    throw new Error('DPM Postgres authoring source must contain artifactIdentity and freshnessIdentity')
  }
  return {
    artifactIdentity: record.artifactIdentity,
    freshnessIdentity: record.freshnessIdentity,
    ...(typeof record.provenanceIdentity === 'string' ? { provenanceIdentity: record.provenanceIdentity } : {}),
  }
}

function parseJsonRecord(value: unknown, label: string): Record<string, unknown> {
  const parsed = typeof value === 'string' ? JSON.parse(value) as unknown : value
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`DPM Postgres authoring ${label} must be a JSON object`)
  }
  return parsed as Record<string, unknown>
}

function addIndexRow(
  rows: Map<string, DpmAuthoringIdentityIndexRow>,
  row: DpmAuthoringIdentityIndexRow,
): void {
  const key = `${row.identityKind}:${row.identityKey}`
  if (!rows.has(key)) rows.set(key, row)
}

function rowsFromQueryResult<T>(result: QueryResult<T>): readonly T[] {
  return Array.isArray(result) ? result : (result as { rows: readonly T[] }).rows
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function freezeDeep<T>(value: T): T {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value
  for (const child of Object.values(value as Record<string, unknown>)) freezeDeep(child)
  return Object.freeze(value)
}
