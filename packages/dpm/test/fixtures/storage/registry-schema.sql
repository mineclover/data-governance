create schema if not exists dpm;

create table if not exists dpm.relationship_registry (
  id bigint generated always as identity primary key,
  dataset_id text not null,
  registry_version text not null,
  canonical_key_encoding_version text not null default 'string-v1',
  relationship_name text not null,
  relationship_version text not null,
  status text not null,
  relationship_type text not null,
  parent_table text not null,
  parent_columns text[] not null,
  child_table text not null,
  child_columns text[] not null,
  namespace text not null,
  transform_strategy text not null,
  orphan_policy text not null,
  context_columns text[] not null default '{}',
  condition_sql text,
  temporal_condition text,
  confidence_score double precision,
  evidence jsonb not null default '[]'::jsonb,
  approval jsonb not null,
  supersedes text,
  superseded_by text,
  source jsonb,
  source_freshness_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dpm_relationship_registry_status_check check (
    status in ('candidate', 'proposed', 'approved', 'rejected', 'deprecated', 'superseded')
  ),
  constraint dpm_relationship_registry_canonical_key_encoding_check check (
    canonical_key_encoding_version in ('string-v1', 'typed-v2')
  ),
  constraint dpm_relationship_registry_type_check check (
    relationship_type in (
      'one_to_one',
      'one_to_many',
      'many_to_one',
      'many_to_many_edge',
      'self_reference',
      'polymorphic',
      'temporal',
      'code_lookup'
    )
  ),
  constraint dpm_relationship_registry_transform_strategy_check check (
    transform_strategy in ('entity_token', 'relationship_token', 'keep_code')
  ),
  constraint dpm_relationship_registry_orphan_policy_check check (
    orphan_policy in ('block', 'warn', 'tolerate', 'tolerate_null', 'create_placeholder_parent', 'lookup_archive')
  ),
  constraint dpm_relationship_registry_parent_columns_check check (cardinality(parent_columns) > 0),
  constraint dpm_relationship_registry_child_columns_check check (cardinality(child_columns) > 0),
  constraint dpm_relationship_registry_confidence_score_check check (
    confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)
  )
);

create table if not exists dpm.relationship_registry_contracts (
  dataset_id text not null,
  registry_version text not null,
  canonical_key_encoding_version text not null default 'string-v1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dpm_relationship_registry_contracts_pk primary key (dataset_id, registry_version),
  constraint dpm_relationship_registry_contracts_encoding_unique unique (
    dataset_id,
    registry_version,
    canonical_key_encoding_version
  ),
  constraint dpm_relationship_registry_contracts_encoding_check check (
    canonical_key_encoding_version in ('string-v1', 'typed-v2')
  )
);

alter table dpm.relationship_registry
  add column if not exists canonical_key_encoding_version text not null default 'string-v1';

update dpm.relationship_registry
set canonical_key_encoding_version = 'string-v1'
where canonical_key_encoding_version is null;

alter table dpm.relationship_registry
  alter column canonical_key_encoding_version set default 'string-v1',
  alter column canonical_key_encoding_version set not null;

do $$
begin
  if exists (
    select 1
    from dpm.relationship_registry
    group by dataset_id, registry_version
    having count(distinct canonical_key_encoding_version) > 1
  ) then
    raise exception 'DPM registry storage migration found mixed canonical key encoding versions.';
  end if;

  if exists (
    select 1
    from dpm.relationship_registry rows
    join dpm.relationship_registry_contracts contracts
      on contracts.dataset_id = rows.dataset_id
      and contracts.registry_version = rows.registry_version
    where contracts.canonical_key_encoding_version <> rows.canonical_key_encoding_version
  ) then
    raise exception 'DPM registry storage migration found relationship rows that conflict with registry contracts.';
  end if;
end
$$;

insert into dpm.relationship_registry_contracts (
  dataset_id,
  registry_version,
  canonical_key_encoding_version
)
select
  dataset_id,
  registry_version,
  min(canonical_key_encoding_version)
from dpm.relationship_registry
group by dataset_id, registry_version
on conflict (dataset_id, registry_version) do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'dpm_relationship_registry_canonical_key_encoding_check'
      and conrelid = 'dpm.relationship_registry'::regclass
  ) then
    alter table dpm.relationship_registry
      add constraint dpm_relationship_registry_canonical_key_encoding_check check (
        canonical_key_encoding_version in ('string-v1', 'typed-v2')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'dpm_relationship_registry_encoding_contract_fk'
      and conrelid = 'dpm.relationship_registry'::regclass
  ) then
    alter table dpm.relationship_registry
      add constraint dpm_relationship_registry_encoding_contract_fk foreign key (
        dataset_id,
        registry_version,
        canonical_key_encoding_version
      ) references dpm.relationship_registry_contracts (
        dataset_id,
        registry_version,
        canonical_key_encoding_version
      );
  end if;
end
$$;

create table if not exists dpm.relationship_registry_audit_events (
  id bigint generated always as identity primary key,
  event_id text not null,
  event_type text not null,
  dataset_id text not null,
  registry_version text not null,
  relationship_name text not null,
  relationship_version text not null,
  relationship_status text not null,
  actor text not null,
  reason text not null,
  source_freshness_hash text,
  approval jsonb not null,
  source jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint dpm_relationship_registry_audit_event_type_check check (
    event_type in ('relationship_approved')
  ),
  constraint dpm_relationship_registry_audit_status_check check (
    relationship_status in ('candidate', 'proposed', 'approved', 'rejected', 'deprecated', 'superseded')
  )
);

create unique index if not exists dpm_relationship_registry_identity_idx
  on dpm.relationship_registry (dataset_id, registry_version, relationship_name, relationship_version);

create index if not exists dpm_relationship_registry_lookup_idx
  on dpm.relationship_registry (dataset_id, registry_version, relationship_name);

create unique index if not exists dpm_relationship_registry_approved_idx
  on dpm.relationship_registry (dataset_id, registry_version, relationship_name)
  where status = 'approved';

create index if not exists dpm_relationship_registry_supersession_idx
  on dpm.relationship_registry (dataset_id, supersedes, superseded_by)
  where supersedes is not null or superseded_by is not null;

create unique index if not exists dpm_relationship_registry_audit_event_id_idx
  on dpm.relationship_registry_audit_events (event_id);

create index if not exists dpm_relationship_registry_audit_lookup_idx
  on dpm.relationship_registry_audit_events (
    dataset_id,
    registry_version,
    relationship_name,
    occurred_at
  );
