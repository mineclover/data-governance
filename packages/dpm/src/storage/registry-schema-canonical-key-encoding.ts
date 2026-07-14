export const DPM_REGISTRY_STORAGE_CANONICAL_KEY_ENCODING_MIGRATION_SQL = `create table if not exists dpm.relationship_registry_contracts (
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
$$;`
