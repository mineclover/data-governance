/**
 * Private SQL proposal with one isolated synthetic PostgreSQL rehearsal recorded.
 * Not a migration, database client, storage adapter, or public package seam.
 * Offline tests inspect strings/recipes only; local evidence is not production readiness.
 */
export const DPM_READ_MODEL_POSTGRES_PROPOSAL_VERSION = 'proposal-1' as const

// Fixed proposal namespace, not an approved target or interpolated identifier.
export const DPM_READ_MODEL_POSTGRES_SCHEMA_SQL = `create schema if not exists dpm_read_model;

create table dpm_read_model.source_expectations (
  owner_namespace text not null check (btrim(owner_namespace) <> ''),
  definition_id text not null check (btrim(definition_id) <> ''),
  revision_id text not null check (btrim(revision_id) <> ''),
  freshness_identity text not null check (btrim(freshness_identity) <> ''),
  manifest_identity text not null check (btrim(manifest_identity) <> ''),
  expected_projection jsonb not null check (jsonb_typeof(expected_projection) = 'object'),
  writer_epoch bigint not null default 0 check (writer_epoch >= 0),
  primary key (owner_namespace, definition_id)
);

create table dpm_read_model.build_attempts (
  owner_namespace text not null,
  definition_id text not null,
  attempt_id text not null check (btrim(attempt_id) <> ''),
  revision_id text not null,
  freshness_identity text not null,
  manifest_identity text not null,
  writer_epoch bigint not null check (writer_epoch > 0),
  state text not null check (state in ('building', 'ready', 'stale', 'failed')),
  expected_projection jsonb not null check (jsonb_typeof(expected_projection) = 'object'),
  primary key (owner_namespace, definition_id, attempt_id),
  unique (owner_namespace, definition_id, writer_epoch),
  unique (owner_namespace, definition_id, attempt_id, revision_id, freshness_identity, manifest_identity, writer_epoch),
  foreign key (owner_namespace, definition_id)
    references dpm_read_model.source_expectations (owner_namespace, definition_id)
);

create table dpm_read_model.projected_fields (
  owner_namespace text not null,
  definition_id text not null,
  attempt_id text not null,
  object_id text not null check (btrim(object_id) <> ''),
  projection jsonb not null check (
    jsonb_typeof(projection) = 'object'
    and projection ?& array['field', 'identities', 'apiBindings']
    and projection - array['field', 'identities', 'apiBindings']::text[] = '{}'::jsonb
    and jsonb_typeof(projection -> 'field') = 'object'
    and jsonb_typeof(projection -> 'identities') = 'array'
    and jsonb_typeof(projection -> 'apiBindings') = 'array'
  ),
  primary key (owner_namespace, definition_id, attempt_id, object_id),
  foreign key (owner_namespace, definition_id, attempt_id)
    references dpm_read_model.build_attempts (owner_namespace, definition_id, attempt_id)
);

create table dpm_read_model.ready_pointers (
  owner_namespace text not null,
  definition_id text not null,
  attempt_id text not null,
  revision_id text not null,
  freshness_identity text not null,
  manifest_identity text not null,
  writer_epoch bigint not null,
  primary key (owner_namespace, definition_id),
  foreign key (owner_namespace, definition_id, attempt_id, revision_id, freshness_identity, manifest_identity, writer_epoch)
    references dpm_read_model.build_attempts
      (owner_namespace, definition_id, attempt_id, revision_id, freshness_identity, manifest_identity, writer_epoch)
);`

// Expected projections must be derived from validated identity-only rows by an approved
// source registrar, not accepted as arbitrary builder payloads. SQL is not a sanitizer/IdP.
export const DPM_READ_MODEL_POSTGRES_STATEMENTS = {
  registerSource: {
    parameters: ['ownerNamespace', 'definitionId', 'revisionId', 'freshnessIdentity', 'manifestIdentity', 'expectedProjection'],
    sql: `insert into dpm_read_model.source_expectations as s
  (owner_namespace, definition_id, revision_id, freshness_identity, manifest_identity, expected_projection)
values ($1, $2, $3, $4, $5, $6::jsonb)
on conflict (owner_namespace, definition_id) do update set
  revision_id = excluded.revision_id,
  freshness_identity = excluded.freshness_identity,
  manifest_identity = excluded.manifest_identity,
  expected_projection = excluded.expected_projection,
  writer_epoch = s.writer_epoch + 1
where row(s.revision_id, s.freshness_identity, s.manifest_identity, s.expected_projection)
  is distinct from row(excluded.revision_id, excluded.freshness_identity, excluded.manifest_identity, excluded.expected_projection)
returning writer_epoch`,
  },
  lockSource: {
    parameters: ['ownerNamespace', 'definitionId'],
    sql: `select revision_id, freshness_identity, manifest_identity, expected_projection, writer_epoch
from dpm_read_model.source_expectations
where owner_namespace = $1 and definition_id = $2
for update`,
  },
  findAttempt: {
    parameters: ['ownerNamespace', 'definitionId', 'attemptId'],
    sql: `select attempt_id, revision_id, freshness_identity, manifest_identity, writer_epoch, state
from dpm_read_model.build_attempts
where owner_namespace = $1 and definition_id = $2 and attempt_id = $3`,
  },
  advanceEpoch: {
    parameters: ['ownerNamespace', 'definitionId', 'revisionId', 'freshnessIdentity', 'manifestIdentity', 'expectedEpoch'],
    sql: `update dpm_read_model.source_expectations set writer_epoch = writer_epoch + 1
where owner_namespace = $1 and definition_id = $2
  and revision_id = $3 and freshness_identity = $4 and manifest_identity = $5
  and writer_epoch = $6::bigint
returning writer_epoch`,
  },
  insertAttempt: {
    parameters: ['ownerNamespace', 'definitionId', 'attemptId', 'writerEpoch'],
    sql: `insert into dpm_read_model.build_attempts
  (owner_namespace, definition_id, attempt_id, revision_id, freshness_identity, manifest_identity,
   writer_epoch, state, expected_projection)
select s.owner_namespace, s.definition_id, $3, s.revision_id, s.freshness_identity, s.manifest_identity,
  s.writer_epoch, 'building', s.expected_projection
from dpm_read_model.source_expectations s
where s.owner_namespace = $1 and s.definition_id = $2 and s.writer_epoch = $4::bigint
returning attempt_id`,
  },
  stageRow: {
    parameters: ['ownerNamespace', 'definitionId', 'attemptId', 'writerEpoch', 'objectId', 'projection'],
    sql: `insert into dpm_read_model.projected_fields
  (owner_namespace, definition_id, attempt_id, object_id, projection)
select a.owner_namespace, a.definition_id, a.attempt_id, $5, $6::jsonb
from dpm_read_model.build_attempts a
join dpm_read_model.source_expectations s
  on s.owner_namespace = a.owner_namespace and s.definition_id = a.definition_id
where a.owner_namespace = $1 and a.definition_id = $2 and a.attempt_id = $3
  and a.writer_epoch = $4::bigint and a.writer_epoch = s.writer_epoch and a.state = 'building'
  and a.revision_id = s.revision_id and a.freshness_identity = s.freshness_identity
  and a.manifest_identity = s.manifest_identity
  and a.expected_projection = s.expected_projection
  and a.expected_projection ? $5::text and a.expected_projection -> ($5::text) = $6::jsonb
returning object_id`,
  },
  promoteReady: {
    parameters: ['ownerNamespace', 'definitionId', 'attemptId', 'writerEpoch'],
    sql: `update dpm_read_model.build_attempts a set state = 'ready'
from dpm_read_model.source_expectations s
where a.owner_namespace = $1 and a.definition_id = $2 and a.attempt_id = $3
  and s.owner_namespace = a.owner_namespace and s.definition_id = a.definition_id
  and a.writer_epoch = $4::bigint and a.writer_epoch = s.writer_epoch and a.state = 'building'
  and a.revision_id = s.revision_id and a.freshness_identity = s.freshness_identity
  and a.manifest_identity = s.manifest_identity and a.expected_projection = s.expected_projection
  and not exists (
    select 1 from jsonb_each(a.expected_projection) expected
    where not exists (
      select 1 from dpm_read_model.projected_fields p
      where p.owner_namespace = a.owner_namespace and p.definition_id = a.definition_id
        and p.attempt_id = a.attempt_id and p.object_id = expected.key and p.projection = expected.value
    )
  )
  and not exists (
    select 1 from dpm_read_model.projected_fields p
    where p.owner_namespace = a.owner_namespace and p.definition_id = a.definition_id
      and p.attempt_id = a.attempt_id and not (a.expected_projection ? p.object_id)
  )
returning a.attempt_id`,
  },
  setReadyPointer: {
    parameters: ['ownerNamespace', 'definitionId', 'attemptId', 'writerEpoch'],
    sql: `insert into dpm_read_model.ready_pointers
  (owner_namespace, definition_id, attempt_id, revision_id, freshness_identity, manifest_identity, writer_epoch)
select a.owner_namespace, a.definition_id, a.attempt_id, a.revision_id,
  a.freshness_identity, a.manifest_identity, a.writer_epoch
from dpm_read_model.build_attempts a
join dpm_read_model.source_expectations s
  on s.owner_namespace = a.owner_namespace and s.definition_id = a.definition_id
where a.owner_namespace = $1 and a.definition_id = $2 and a.attempt_id = $3
  and a.writer_epoch = $4::bigint and a.writer_epoch = s.writer_epoch and a.state = 'ready'
  and a.revision_id = s.revision_id and a.freshness_identity = s.freshness_identity
  and a.manifest_identity = s.manifest_identity and a.expected_projection = s.expected_projection
on conflict (owner_namespace, definition_id) do update set
  attempt_id = excluded.attempt_id, revision_id = excluded.revision_id,
  freshness_identity = excluded.freshness_identity, manifest_identity = excluded.manifest_identity,
  writer_epoch = excluded.writer_epoch
returning attempt_id`,
  },
  failAttempt: {
    parameters: ['ownerNamespace', 'definitionId', 'attemptId', 'writerEpoch'],
    sql: `update dpm_read_model.build_attempts a set state = 'failed'
from dpm_read_model.source_expectations s
where a.owner_namespace = $1 and a.definition_id = $2 and a.attempt_id = $3
  and s.owner_namespace = a.owner_namespace and s.definition_id = a.definition_id
  and a.writer_epoch = $4::bigint and a.writer_epoch = s.writer_epoch and a.state = 'building'
  and a.revision_id = s.revision_id and a.freshness_identity = s.freshness_identity
  and a.manifest_identity = s.manifest_identity and a.expected_projection = s.expected_projection
returning a.attempt_id`,
  },
  readScopeReadiness: {
    // These IDs must already have passed owner-injected scope authorization. Not an ACL.
    parameters: ['ownerNamespace', 'authorizedDefinitionIds'],
    sql: `with requested as (
  select distinct definition_id from unnest($2::text[]) as requested_ids(definition_id)
), unavailable as (
  select r.definition_id from requested r
  left join dpm_read_model.source_expectations s
    on s.owner_namespace = $1 and s.definition_id = r.definition_id
  left join dpm_read_model.ready_pointers p
    on p.owner_namespace = s.owner_namespace and p.definition_id = s.definition_id
  left join dpm_read_model.build_attempts a
    on a.owner_namespace = p.owner_namespace and a.definition_id = p.definition_id and a.attempt_id = p.attempt_id
  where s.definition_id is null or p.attempt_id is null or a.attempt_id is null
    or a.state <> 'ready' or a.writer_epoch <> s.writer_epoch or p.writer_epoch <> s.writer_epoch
    or a.revision_id <> s.revision_id or p.revision_id <> s.revision_id
    or a.freshness_identity <> s.freshness_identity or p.freshness_identity <> s.freshness_identity
    or a.manifest_identity <> s.manifest_identity or p.manifest_identity <> s.manifest_identity
    or a.expected_projection <> s.expected_projection
)
select case
  when not exists (select 1 from requested)
    or exists (select 1 from requested where definition_id is null or btrim(definition_id) = '') then 'forbidden'
  when exists (select 1 from unavailable) then 'read-model-unavailable'
  else 'ready'
end as status`,
  },
} as const

// Declarative transaction recipes only. No query/transaction callback or client is provided.
// Use separate statements in one READ COMMITTED transaction with the source lock held to commit.
// Lock first, then re-read attempt/source state: do not collapse this into one snapshot-based CTE.
export const DPM_READ_MODEL_POSTGRES_TRANSACTION_RECIPES = {
  begin: ['lockSource', 'findAttempt', 'advanceEpoch', 'insertAttempt'],
  append: ['lockSource', 'stageRow'],
  complete: ['lockSource', 'promoteReady', 'setReadyPointer'],
  fail: ['lockSource', 'failAttempt'],
} as const satisfies Readonly<Record<string, readonly (keyof typeof DPM_READ_MODEL_POSTGRES_STATEMENTS)[]>>
