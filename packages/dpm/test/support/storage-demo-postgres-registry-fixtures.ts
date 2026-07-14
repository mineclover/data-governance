import {
  createDpmPostgresRegistryStorage,
  createDpmRegistryRepository,
  type DpmPostgresRegistryClient,
  type DpmPostgresRegistryQueryClient,
  type DpmRegistryRelationshipAuditEventRow,
  type DpmRegistryRelationshipRow,
  type DpmRegistryWritableRepository,
} from '../../src/index.js'

export type StorageDemoPostgresRegistryQueryCall = {
  sql: string
  params: readonly unknown[]
}

export type StorageDemoPostgresRegistryClient = DpmPostgresRegistryClient & {
  queryCalls: StorageDemoPostgresRegistryQueryCall[]
}

export type StorageDemoPostgresRegistryRepositoryFixture = {
  client: StorageDemoPostgresRegistryClient
  repository: DpmRegistryWritableRepository
}

export function createStorageDemoPostgresRegistryRepository(
  relationshipRows: DpmRegistryRelationshipRow[],
  auditEvents: DpmRegistryRelationshipAuditEventRow[] = [],
): StorageDemoPostgresRegistryRepositoryFixture {
  const client = createStorageDemoPostgresRegistryClient(relationshipRows, auditEvents)
  const repository = createDpmRegistryRepository(createDpmPostgresRegistryStorage(client))

  return { client, repository }
}

export function createStorageDemoPostgresRegistryClient(
  relationshipRows: DpmRegistryRelationshipRow[],
  auditEvents: DpmRegistryRelationshipAuditEventRow[] = [],
): StorageDemoPostgresRegistryClient {
  const relationshipDbRows = relationshipRows.map(toPostgresRelationshipDbRow)
  const registryContractDbRows = toPostgresRegistryContractDbRows(relationshipRows)
  const auditEventDbRows = auditEvents.map(toPostgresAuditEventDbRow)
  const queryCalls: StorageDemoPostgresRegistryQueryCall[] = []
  const client: StorageDemoPostgresRegistryClient = {
    queryCalls,
    async query<T>(sql: string, params: readonly unknown[]) {
      queryCalls.push({ sql, params })
      if (isRegistrySchemaSql(sql)) {
        return { rows: [] as readonly T[] }
      }
      if (sql.includes('from dpm.relationship_registry_audit_events')) {
        const [datasetId, registryVersion, relationshipName] = params
        const rows = auditEventDbRows.filter(row =>
          row.dataset_id === datasetId
          && row.registry_version === registryVersion
          && (relationshipName === null || row.relationship_name === relationshipName)
        )

        return { rows: rows as readonly T[] }
      }
      if (sql.includes('from dpm.relationship_registry_contracts')) {
        const [datasetId, registryVersion] = params
        const rows = registryContractDbRows.filter(row =>
          row.dataset_id === datasetId && row.registry_version === registryVersion
        )

        return { rows: rows as readonly T[] }
      }
      if (sql.includes('from dpm.relationship_registry')) {
        const [datasetId, registryVersion] = params
        const rows = relationshipDbRows.filter(row =>
          row.dataset_id === datasetId && row.registry_version === registryVersion
        )

        return { rows: rows as readonly T[] }
      }

      throw new Error('unexpected storage demo Postgres registry query')
    },
    async transaction<T>(
      operation: (client: DpmPostgresRegistryQueryClient) => Promise<T>,
    ) {
      return operation(client)
    },
  }

  return client
}

function toPostgresRegistryContractDbRows(
  rows: readonly DpmRegistryRelationshipRow[],
): Record<string, unknown>[] {
  const contracts = new Map<string, Record<string, unknown>>()
  for (const row of rows) {
    const key = `${row.datasetId}\u0000${row.registryVersion}`
    contracts.set(key, {
      dataset_id: row.datasetId,
      registry_version: row.registryVersion,
      canonical_key_encoding_version: row.canonicalKeyEncodingVersion ?? 'string-v1',
    })
  }
  return [...contracts.values()]
}

function isRegistrySchemaSql(sql: string): boolean {
  const normalized = sql.trim().toLowerCase()
  return normalized.startsWith('create schema')
    || normalized.startsWith('create table')
    || normalized.startsWith('create unique index')
    || normalized.startsWith('create index')
    || normalized.startsWith('alter table')
    || normalized.startsWith('update dpm.relationship_registry')
    || normalized.startsWith('do $$')
}

function toPostgresRelationshipDbRow(row: DpmRegistryRelationshipRow): Record<string, unknown> {
  return {
    dataset_id: row.datasetId,
    registry_version: row.registryVersion,
    canonical_key_encoding_version: row.canonicalKeyEncodingVersion ?? null,
    relationship_name: row.relationshipName,
    relationship_version: row.relationshipVersion,
    status: row.status,
    relationship_type: row.relationshipType,
    parent_table: row.parentTable,
    parent_columns: row.parentColumns,
    child_table: row.childTable,
    child_columns: row.childColumns,
    namespace: row.namespace,
    transform_strategy: row.transformStrategy,
    orphan_policy: row.orphanPolicy,
    context_columns: row.contextColumns,
    condition_sql: row.conditionSql ?? null,
    temporal_condition: row.temporalCondition ?? null,
    confidence_score: row.confidenceScore ?? null,
    evidence: row.evidence,
    approval: row.approval,
    supersedes: row.supersedes ?? null,
    superseded_by: row.supersededBy ?? null,
    source: row.source ?? null,
    source_freshness_hash: row.sourceFreshnessHash ?? null,
    created_at: row.createdAt ?? null,
    updated_at: row.updatedAt ?? null,
  }
}

function toPostgresAuditEventDbRow(
  row: DpmRegistryRelationshipAuditEventRow,
): Record<string, unknown> {
  return {
    event_id: row.eventId,
    event_type: row.eventType,
    dataset_id: row.datasetId,
    registry_version: row.registryVersion,
    relationship_name: row.relationshipName,
    relationship_version: row.relationshipVersion,
    relationship_status: row.relationshipStatus,
    actor: row.actor,
    reason: row.reason,
    source_freshness_hash: row.sourceFreshnessHash ?? null,
    approval: row.approval,
    source: row.source ?? null,
    occurred_at: row.occurredAt,
    created_at: row.createdAt ?? null,
  }
}
