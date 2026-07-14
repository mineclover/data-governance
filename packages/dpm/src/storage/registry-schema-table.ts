import {
  DPM_REGISTRY_STORAGE_TABLE_CHECKS_SQL,
} from './registry-schema-table-checks.js'
import {
  DPM_REGISTRY_STORAGE_TABLE_COLUMNS_SQL,
} from './registry-schema-table-columns.js'

export const DPM_REGISTRY_STORAGE_TABLE_SQL = `create schema if not exists dpm;

create table if not exists dpm.relationship_registry (
${DPM_REGISTRY_STORAGE_TABLE_COLUMNS_SQL}
${DPM_REGISTRY_STORAGE_TABLE_CHECKS_SQL}
);`
