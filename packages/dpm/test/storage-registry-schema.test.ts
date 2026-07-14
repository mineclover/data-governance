import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  applyDpmRegistryStorageSchema,
  DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS,
  DPM_REGISTRY_STORAGE_SCHEMA_VERSION,
  DPM_REGISTRY_STORAGE_SCHEMA_SQL,
} from '../src/index.js'

const storageFixturesRoot = new URL('./fixtures/storage/', import.meta.url)

describe('DPM registry storage schema', () => {
  it('defines a Postgres schema for durable relationship lifecycle records', () => {
    const sql = normalizeSql(DPM_REGISTRY_STORAGE_SCHEMA_SQL)
    const fixtureSql = normalizeSql(readFileSync(join(storageFixturesRoot.pathname, 'registry-schema.sql'), 'utf8'))

    expect(sql).toBe(fixtureSql)
    expect(sql).toContain('create schema if not exists dpm')
    expect(sql).toContain('create table if not exists dpm.relationship_registry')
    expect(sql).toContain('create table if not exists dpm.relationship_registry_contracts')
    expect(sql).toContain('create table if not exists dpm.relationship_registry_audit_events')
    expect(sql).toContain('id bigint generated always as identity primary key')
    expect(sql).toContain('dataset_id text not null')
    expect(sql).toContain('registry_version text not null')
    expect(sql).toContain("canonical_key_encoding_version text not null default 'string-v1'")
    expect(sql).toContain('relationship_name text not null')
    expect(sql).toContain('relationship_version text not null')
    expect(sql).toContain('status text not null')
    expect(sql).toContain('approval jsonb not null')
    expect(sql).toContain('created_at timestamptz not null default now()')
    expect(sql).toContain('updated_at timestamptz not null default now()')
    expect(sql).toContain('constraint dpm_relationship_registry_status_check check')
    expect(sql).toContain('constraint dpm_relationship_registry_canonical_key_encoding_check check')
    expect(sql).toContain('add column if not exists canonical_key_encoding_version')
    expect(sql).toContain('dpm_relationship_registry_contracts_encoding_unique unique')
    expect(sql).toContain('dpm_relationship_registry_encoding_contract_fk foreign key')
    expect(sql).toContain('having count(distinct canonical_key_encoding_version) > 1')
    expect(sql).toContain('migration found mixed canonical key encoding versions')
    expect(sql).toContain('insert into dpm.relationship_registry_contracts')
    expect(sql).toContain('constraint dpm_relationship_registry_orphan_policy_check check')
    expect(sql).toContain('create unique index if not exists dpm_relationship_registry_identity_idx')
    expect(sql).toContain('on dpm.relationship_registry (dataset_id, registry_version, relationship_name, relationship_version)')
    expect(sql).toContain('create unique index if not exists dpm_relationship_registry_approved_idx')
    expect(sql).toContain("where status = 'approved'")
    expect(sql).toContain('constraint dpm_relationship_registry_audit_event_type_check check')
    expect(sql).toContain("event_type in ('relationship_approved')")
    expect(sql).toContain('create unique index if not exists dpm_relationship_registry_audit_event_id_idx')
    expect(sql).toContain('create index if not exists dpm_relationship_registry_audit_lookup_idx')
    expect(DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.join('\n\n')).toBe(DPM_REGISTRY_STORAGE_SCHEMA_SQL)
    expect(DPM_REGISTRY_STORAGE_SCHEMA_VERSION).toBe('dpm.registry-storage.v2')
  })

  it('applies the Postgres schema blocks through an explicit query client', async () => {
    const calls: { sql: string, parameters: readonly unknown[] }[] = []

    const result = await applyDpmRegistryStorageSchema({
      query(sql, parameters) {
        calls.push({ sql, parameters })
      },
    })

    expect(result).toEqual({
      schemaVersion: DPM_REGISTRY_STORAGE_SCHEMA_VERSION,
      appliedBlockCount: DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.length,
    })
    expect(calls).toEqual(DPM_REGISTRY_STORAGE_SCHEMA_SQL_BLOCKS.map(sql => ({
      sql,
      parameters: [],
    })))
  })
})

function normalizeSql(sql: string): string {
  return sql.replace(/\s+/g, ' ').trim().toLowerCase()
}
