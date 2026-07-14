export const DPM_REGISTRY_STORAGE_INDEX_SQL = `create unique index if not exists dpm_relationship_registry_identity_idx
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
  );`
