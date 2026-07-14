export const DPM_REGISTRY_STORAGE_AUDIT_TABLE_SQL = `create table if not exists dpm.relationship_registry_audit_events (
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
);`
