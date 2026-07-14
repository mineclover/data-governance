import type {
  DpmRegistryCanonicalKeyEncodingClaimInput,
  DpmRegistryCanonicalKeyEncodingContract,
  DpmRegistryCanonicalKeyEncodingContractRequest,
  DpmRegistryRelationshipApprovalCommitInput,
  DpmRegistryRelationshipApprovalCommitResult,
  DpmRegistryRelationshipAuditEventRow,
  DpmRegistryRelationshipAuditEventRequest,
  DpmRegistryRelationshipRow,
  DpmRegistryRelationshipRowRequest,
  DpmRegistryStorage,
} from './registry-repository-types.js'
import {
  REGISTRY_ORPHAN_POLICIES,
} from '../registry/registry-orphan-policy-taxonomy.js'
import {
  REGISTRY_RELATIONSHIP_KINDS,
} from '../registry/registry-relationship-kind-taxonomy.js'
import {
  REGISTRY_RELATIONSHIP_STATUSES,
} from '../registry/registry-relationship-status-taxonomy.js'
import {
  REGISTRY_TRANSFORM_STRATEGIES,
} from '../registry/registry-transform-taxonomy.js'
import {
  resolveDpmCanonicalKeyEncodingVersion,
  type DpmCanonicalKeyEncodingVersion,
} from '../model/canonical-key-encoding.js'
import {
  copyDpmRegistryRelationshipAuditEventRow,
} from './registry-audit-event.js'
import {
  DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES,
} from './registry-audit-row-types.js'
import {
  copyDpmRegistryRelationshipRow,
} from './registry-row-relationship.js'
import {
  DpmRegistryApprovedRelationshipConflictError,
} from './registry-storage-errors.js'

type QueryResult<T> = readonly T[] | { rows: readonly T[] }

export type DpmPostgresRegistryQueryClient = {
  query<T>(sql: string, parameters: readonly unknown[]): Promise<QueryResult<T>>
}

export type DpmPostgresRegistryClient = DpmPostgresRegistryQueryClient & {
  transaction<T>(
    operation: (client: DpmPostgresRegistryQueryClient) => Promise<T>,
  ): Promise<T>
}

export function createDpmPostgresRegistryStorage(
  client: DpmPostgresRegistryClient,
): DpmRegistryStorage {
  return {
    async readCanonicalKeyEncodingContract(request) {
      return readDpmPostgresRegistryCanonicalKeyEncodingContract(client, request)
    },
    async claimCanonicalKeyEncodingVersion(input) {
      return claimDpmPostgresRegistryCanonicalKeyEncodingVersion(client, input)
    },
    async listRelationshipRows(request) {
      return listDpmPostgresRegistryRelationshipRows(client, request)
    },
    async upsertRelationshipRow(row) {
      await upsertDpmPostgresRegistryRelationshipRow(client, row)
    },
    async commitRelationshipApproval(input) {
      return commitDpmPostgresRegistryRelationshipApproval(client, input)
    },
    async appendRelationshipAuditEvent(row) {
      return appendDpmPostgresRegistryRelationshipAuditEvent(client, row)
    },
    async listRelationshipAuditEvents(request) {
      return listDpmPostgresRegistryRelationshipAuditEvents(client, request)
    },
  }
}

async function readDpmPostgresRegistryCanonicalKeyEncodingContract(
  client: DpmPostgresRegistryQueryClient,
  request: DpmRegistryCanonicalKeyEncodingContractRequest,
): Promise<DpmRegistryCanonicalKeyEncodingContract | undefined> {
  const result = await client.query<DpmPostgresRegistryEncodingContractDbRow>(
    DPM_POSTGRES_REGISTRY_ENCODING_CONTRACT_SELECT_SQL,
    [request.datasetId, request.registryVersion],
  )
  const row = rowsFromQueryResult(result)[0]
  return row ? postgresRegistryEncodingContractToSdk(row) : undefined
}

async function claimDpmPostgresRegistryCanonicalKeyEncodingVersion(
  client: DpmPostgresRegistryQueryClient,
  input: DpmRegistryCanonicalKeyEncodingClaimInput,
): Promise<DpmRegistryCanonicalKeyEncodingContract> {
  const result = await client.query<DpmPostgresRegistryEncodingContractDbRow>(
    DPM_POSTGRES_REGISTRY_ENCODING_CONTRACT_CLAIM_SQL,
    [input.datasetId, input.registryVersion, input.canonicalKeyEncodingVersion],
  )
  const row = rowsFromQueryResult(result)[0]
  if (!row) {
    throw new Error(
      `DPM registry ${input.datasetId}@${input.registryVersion} could not atomically claim `
      + `canonical key encoding ${input.canonicalKeyEncodingVersion}.`,
    )
  }
  return postgresRegistryEncodingContractToSdk(row)
}

export async function listDpmPostgresRegistryRelationshipRows(
  client: DpmPostgresRegistryQueryClient,
  request: DpmRegistryRelationshipRowRequest,
): Promise<DpmRegistryRelationshipRow[]> {
  const result = await client.query<DpmPostgresRegistryRelationshipDbRow>(
    `${DPM_POSTGRES_REGISTRY_RELATIONSHIP_SELECT}
where dataset_id = $1 and registry_version = $2
order by relationship_name asc, relationship_version asc`,
    [request.datasetId, request.registryVersion],
  )

  return rowsFromQueryResult(result).map(postgresRegistryRelationshipRowToSdk)
}

export async function upsertDpmPostgresRegistryRelationshipRow(
  client: DpmPostgresRegistryQueryClient,
  row: DpmRegistryRelationshipRow,
): Promise<DpmRegistryRelationshipRow> {
  const result = await queryPostgresRegistryRelationshipUpsert(client, row)
  const saved = rowsFromQueryResult(result)[0]
  if (!saved) {
    throw new Error(`DPM Postgres registry relationship upsert returned no row for ${row.relationshipName}.`)
  }

  return postgresRegistryRelationshipRowToSdk(saved)
}

export async function commitDpmPostgresRegistryRelationshipApproval(
  client: DpmPostgresRegistryClient,
  input: DpmRegistryRelationshipApprovalCommitInput,
): Promise<DpmRegistryRelationshipApprovalCommitResult> {
  return client.transaction(transactionClient =>
    commitDpmPostgresRegistryRelationshipApprovalInTransaction(transactionClient, input)
  )
}

async function commitDpmPostgresRegistryRelationshipApprovalInTransaction(
  client: DpmPostgresRegistryQueryClient,
  input: DpmRegistryRelationshipApprovalCommitInput,
): Promise<DpmRegistryRelationshipApprovalCommitResult> {
  const relationshipRow = await upsertDpmPostgresRegistryRelationshipRow(
    client,
    input.relationshipRow,
  )
  const auditEvent = await appendDpmPostgresRegistryRelationshipAuditEvent(
    client,
    input.auditEvent,
  )

  return {
    relationshipRow,
    auditEvent,
  }
}

export async function appendDpmPostgresRegistryRelationshipAuditEvent(
  client: DpmPostgresRegistryQueryClient,
  row: DpmRegistryRelationshipAuditEventRow,
): Promise<DpmRegistryRelationshipAuditEventRow> {
  const result = await client.query<DpmPostgresRegistryAuditEventDbRow>(
    DPM_POSTGRES_REGISTRY_AUDIT_EVENT_INSERT_SQL,
    auditEventParameters(row),
  )
  const saved = rowsFromQueryResult(result)[0]
  if (!saved) {
    throw new Error(`DPM Postgres registry audit append returned no row for ${row.eventId}.`)
  }

  return postgresRegistryAuditEventRowToSdk(saved)
}

export async function listDpmPostgresRegistryRelationshipAuditEvents(
  client: DpmPostgresRegistryQueryClient,
  request: DpmRegistryRelationshipAuditEventRequest,
): Promise<DpmRegistryRelationshipAuditEventRow[]> {
  const result = await client.query<DpmPostgresRegistryAuditEventDbRow>(
    `${DPM_POSTGRES_REGISTRY_AUDIT_EVENT_SELECT}
where dataset_id = $1
  and registry_version = $2
  and ($3::text is null or relationship_name = $3)
order by occurred_at asc, event_id asc`,
    [request.datasetId, request.registryVersion, request.relationshipName ?? null],
  )

  return rowsFromQueryResult(result).map(postgresRegistryAuditEventRowToSdk)
}

const DPM_POSTGRES_REGISTRY_RELATIONSHIP_SELECT = `select
  dataset_id,
  registry_version,
  canonical_key_encoding_version,
  relationship_name,
  relationship_version,
  status,
  relationship_type,
  parent_table,
  parent_columns,
  child_table,
  child_columns,
  namespace,
  transform_strategy,
  orphan_policy,
  context_columns,
  condition_sql,
  temporal_condition,
  confidence_score,
  evidence,
  approval,
  supersedes,
  superseded_by,
  source,
  source_freshness_hash,
  created_at,
  updated_at
from dpm.relationship_registry`

const DPM_POSTGRES_REGISTRY_ENCODING_CONTRACT_SELECT_SQL = `select
  dataset_id,
  registry_version,
  canonical_key_encoding_version,
  created_at,
  updated_at
from dpm.relationship_registry_contracts
where dataset_id = $1 and registry_version = $2`

const DPM_POSTGRES_REGISTRY_ENCODING_CONTRACT_CLAIM_SQL = `insert into dpm.relationship_registry_contracts (
  dataset_id,
  registry_version,
  canonical_key_encoding_version
) values ($1, $2, $3)
on conflict (dataset_id, registry_version)
do update set updated_at = now()
where dpm.relationship_registry_contracts.canonical_key_encoding_version = excluded.canonical_key_encoding_version
returning
  dataset_id,
  registry_version,
  canonical_key_encoding_version,
  created_at,
  updated_at`

const DPM_POSTGRES_REGISTRY_RELATIONSHIP_UPSERT_SQL = `with claimed_registry_contract as (
  insert into dpm.relationship_registry_contracts (
    dataset_id,
    registry_version,
    canonical_key_encoding_version
  ) values ($1, $2, $3)
  on conflict (dataset_id, registry_version)
  do update set updated_at = now()
  where dpm.relationship_registry_contracts.canonical_key_encoding_version = excluded.canonical_key_encoding_version
  returning dataset_id, registry_version, canonical_key_encoding_version
)
insert into dpm.relationship_registry (
  dataset_id,
  registry_version,
  canonical_key_encoding_version,
  relationship_name,
  relationship_version,
  status,
  relationship_type,
  parent_table,
  parent_columns,
  child_table,
  child_columns,
  namespace,
  transform_strategy,
  orphan_policy,
  context_columns,
  condition_sql,
  temporal_condition,
  confidence_score,
  evidence,
  approval,
  supersedes,
  superseded_by,
  source,
  source_freshness_hash,
  created_at,
  updated_at
) select
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9::text[],
  $10,
  $11::text[],
  $12,
  $13,
  $14,
  $15::text[],
  $16,
  $17,
  $18,
  $19::jsonb,
  $20::jsonb,
  $21,
  $22,
  $23::jsonb,
  $24,
  coalesce($25::timestamptz, now()),
  coalesce($26::timestamptz, now())
from claimed_registry_contract
on conflict (dataset_id, registry_version, relationship_name, relationship_version)
do update set
  status = excluded.status,
  relationship_type = excluded.relationship_type,
  parent_table = excluded.parent_table,
  parent_columns = excluded.parent_columns,
  child_table = excluded.child_table,
  child_columns = excluded.child_columns,
  namespace = excluded.namespace,
  transform_strategy = excluded.transform_strategy,
  orphan_policy = excluded.orphan_policy,
  context_columns = excluded.context_columns,
  condition_sql = excluded.condition_sql,
  temporal_condition = excluded.temporal_condition,
  confidence_score = excluded.confidence_score,
  evidence = excluded.evidence,
  approval = excluded.approval,
  supersedes = excluded.supersedes,
  superseded_by = excluded.superseded_by,
  source = excluded.source,
  source_freshness_hash = excluded.source_freshness_hash,
  updated_at = excluded.updated_at
where dpm.relationship_registry.canonical_key_encoding_version = excluded.canonical_key_encoding_version
returning
  dataset_id,
  registry_version,
  canonical_key_encoding_version,
  relationship_name,
  relationship_version,
  status,
  relationship_type,
  parent_table,
  parent_columns,
  child_table,
  child_columns,
  namespace,
  transform_strategy,
  orphan_policy,
  context_columns,
  condition_sql,
  temporal_condition,
  confidence_score,
  evidence,
  approval,
  supersedes,
  superseded_by,
  source,
  source_freshness_hash,
  created_at,
  updated_at`

const DPM_POSTGRES_REGISTRY_APPROVED_UNIQUE_INDEX = 'dpm_relationship_registry_approved_idx'

const DPM_POSTGRES_REGISTRY_AUDIT_EVENT_SELECT = `select
  event_id,
  event_type,
  dataset_id,
  registry_version,
  relationship_name,
  relationship_version,
  relationship_status,
  actor,
  reason,
  source_freshness_hash,
  approval,
  source,
  occurred_at,
  created_at
from dpm.relationship_registry_audit_events`

const DPM_POSTGRES_REGISTRY_AUDIT_EVENT_INSERT_SQL = `insert into dpm.relationship_registry_audit_events (
  event_id,
  event_type,
  dataset_id,
  registry_version,
  relationship_name,
  relationship_version,
  relationship_status,
  actor,
  reason,
  source_freshness_hash,
  approval,
  source,
  occurred_at,
  created_at
) values (
  $1,
  $2,
  $3,
  $4,
  $5,
  $6,
  $7,
  $8,
  $9,
  $10,
  $11::jsonb,
  $12::jsonb,
  coalesce($13::timestamptz, now()),
  coalesce($14::timestamptz, now())
)
returning
  event_id,
  event_type,
  dataset_id,
  registry_version,
  relationship_name,
  relationship_version,
  relationship_status,
  actor,
  reason,
  source_freshness_hash,
  approval,
  source,
  occurred_at,
  created_at`

type DpmPostgresRegistryRelationshipDbRow = {
  dataset_id: string
  registry_version: string
  canonical_key_encoding_version?: DpmCanonicalKeyEncodingVersion | null
  relationship_name: string
  relationship_version: string
  status: DpmRegistryRelationshipRow['status']
  relationship_type: DpmRegistryRelationshipRow['relationshipType']
  parent_table: string
  parent_columns: readonly string[]
  child_table: string
  child_columns: readonly string[]
  namespace: string
  transform_strategy: DpmRegistryRelationshipRow['transformStrategy']
  orphan_policy: DpmRegistryRelationshipRow['orphanPolicy']
  context_columns: readonly string[]
  condition_sql?: string | null
  temporal_condition?: string | null
  confidence_score?: number | null
  evidence: unknown
  approval: unknown
  supersedes?: string | null
  superseded_by?: string | null
  source?: unknown
  source_freshness_hash?: string | null
  created_at?: string | Date | null
  updated_at?: string | Date | null
}

type DpmPostgresRegistryEncodingContractDbRow = {
  dataset_id: string
  registry_version: string
  canonical_key_encoding_version: DpmCanonicalKeyEncodingVersion
  created_at?: string | Date | null
  updated_at?: string | Date | null
}

type DpmPostgresRegistryAuditEventDbRow = {
  event_id: string
  event_type: DpmRegistryRelationshipAuditEventRow['eventType']
  dataset_id: string
  registry_version: string
  relationship_name: string
  relationship_version: string
  relationship_status: DpmRegistryRelationshipAuditEventRow['relationshipStatus']
  actor: string
  reason: string
  source_freshness_hash?: string | null
  approval: unknown
  source?: unknown
  occurred_at: string | Date
  created_at?: string | Date | null
}

function relationshipRowParameters(row: DpmRegistryRelationshipRow): readonly unknown[] {
  const input = copyDpmRegistryRelationshipRow(row)

  return [
    input.datasetId,
    input.registryVersion,
    input.canonicalKeyEncodingVersion,
    input.relationshipName,
    input.relationshipVersion,
    input.status,
    input.relationshipType,
    input.parentTable,
    input.parentColumns,
    input.childTable,
    input.childColumns,
    input.namespace,
    input.transformStrategy,
    input.orphanPolicy,
    input.contextColumns,
    input.conditionSql ?? null,
    input.temporalCondition ?? null,
    input.confidenceScore ?? null,
    JSON.stringify(input.evidence),
    JSON.stringify(input.approval),
    input.supersedes ?? null,
    input.supersededBy ?? null,
    input.source ? JSON.stringify(input.source) : null,
    input.sourceFreshnessHash ?? null,
    input.createdAt ?? null,
    input.updatedAt ?? null,
  ]
}

async function queryPostgresRegistryRelationshipUpsert(
  client: DpmPostgresRegistryQueryClient,
  row: DpmRegistryRelationshipRow,
): Promise<QueryResult<DpmPostgresRegistryRelationshipDbRow>> {
  try {
    return await client.query<DpmPostgresRegistryRelationshipDbRow>(
      DPM_POSTGRES_REGISTRY_RELATIONSHIP_UPSERT_SQL,
      relationshipRowParameters(row),
    )
  } catch (error) {
    if (isPostgresApprovedRelationshipConflict(error)) {
      throw createPostgresApprovedRelationshipConflictError(row, error)
    }

    throw error
  }
}

function createPostgresApprovedRelationshipConflictError(
  row: DpmRegistryRelationshipRow,
  cause: unknown,
): Error {
  return new DpmRegistryApprovedRelationshipConflictError({
    datasetId: row.datasetId,
    registryVersion: row.registryVersion,
    relationshipName: row.relationshipName,
    relationshipVersion: row.relationshipVersion,
    constraint: DPM_POSTGRES_REGISTRY_APPROVED_UNIQUE_INDEX,
  }, cause)
}

function isPostgresApprovedRelationshipConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const record = error as {
    code?: unknown
    constraint?: unknown
    message?: unknown
  }

  return record.code === '23505' && (
    record.constraint === DPM_POSTGRES_REGISTRY_APPROVED_UNIQUE_INDEX ||
    (
      typeof record.message === 'string' &&
      record.message.includes(DPM_POSTGRES_REGISTRY_APPROVED_UNIQUE_INDEX)
    )
  )
}

function auditEventParameters(row: DpmRegistryRelationshipAuditEventRow): readonly unknown[] {
  const input = copyDpmRegistryRelationshipAuditEventRow(row)

  return [
    input.eventId,
    input.eventType,
    input.datasetId,
    input.registryVersion,
    input.relationshipName,
    input.relationshipVersion,
    input.relationshipStatus,
    input.actor,
    input.reason,
    input.sourceFreshnessHash ?? null,
    JSON.stringify(input.approval),
    input.source ? JSON.stringify(input.source) : null,
    input.occurredAt,
    input.createdAt ?? null,
  ]
}

function postgresRegistryRelationshipRowToSdk(
  row: DpmPostgresRegistryRelationshipDbRow,
): DpmRegistryRelationshipRow {
  return {
    datasetId: row.dataset_id,
    registryVersion: row.registry_version,
    canonicalKeyEncodingVersion: resolveDpmCanonicalKeyEncodingVersion(
      row.canonical_key_encoding_version ?? undefined,
      'Postgres registry row canonical_key_encoding_version',
    ),
    relationshipName: row.relationship_name,
    relationshipVersion: row.relationship_version,
    status: parseEnum(
      row.status,
      REGISTRY_RELATIONSHIP_STATUSES,
      'relationship status',
    ),
    relationshipType: parseEnum(
      row.relationship_type,
      REGISTRY_RELATIONSHIP_KINDS,
      'relationship type',
    ),
    parentTable: row.parent_table,
    parentColumns: parseStringArray(row.parent_columns, 'parent_columns'),
    childTable: row.child_table,
    childColumns: parseStringArray(row.child_columns, 'child_columns'),
    namespace: row.namespace,
    transformStrategy: parseEnum(
      row.transform_strategy,
      REGISTRY_TRANSFORM_STRATEGIES,
      'transform strategy',
    ),
    orphanPolicy: parseEnum(
      row.orphan_policy,
      REGISTRY_ORPHAN_POLICIES,
      'orphan policy',
    ),
    contextColumns: parseStringArray(row.context_columns, 'context_columns'),
    ...(row.condition_sql ? { conditionSql: row.condition_sql } : {}),
    ...(row.temporal_condition ? { temporalCondition: row.temporal_condition } : {}),
    ...(row.confidence_score !== undefined && row.confidence_score !== null
      ? { confidenceScore: row.confidence_score }
      : {}),
    evidence: parseRegistryEvidenceArray(row.evidence),
    approval: parseRegistryApprovalMetadata(row.approval),
    ...(row.supersedes ? { supersedes: row.supersedes } : {}),
    ...(row.superseded_by ? { supersededBy: row.superseded_by } : {}),
    ...(row.source ? { source: parseSchemaSourceCoordinate(row.source, 'source') } : {}),
    ...(row.source_freshness_hash ? { sourceFreshnessHash: row.source_freshness_hash } : {}),
    ...(row.created_at ? { createdAt: toIsoString(row.created_at) } : {}),
    ...(row.updated_at ? { updatedAt: toIsoString(row.updated_at) } : {}),
  } as DpmRegistryRelationshipRow
}

function postgresRegistryEncodingContractToSdk(
  row: DpmPostgresRegistryEncodingContractDbRow,
): DpmRegistryCanonicalKeyEncodingContract {
  return {
    datasetId: row.dataset_id,
    registryVersion: row.registry_version,
    canonicalKeyEncodingVersion: resolveDpmCanonicalKeyEncodingVersion(
      row.canonical_key_encoding_version,
      'Postgres registry contract canonical_key_encoding_version',
    ),
    ...(row.created_at ? { createdAt: toIsoString(row.created_at) } : {}),
    ...(row.updated_at ? { updatedAt: toIsoString(row.updated_at) } : {}),
  }
}

function postgresRegistryAuditEventRowToSdk(
  row: DpmPostgresRegistryAuditEventDbRow,
): DpmRegistryRelationshipAuditEventRow {
  return {
    eventId: row.event_id,
    eventType: parseEnum(
      row.event_type,
      DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES,
      'audit event type',
    ),
    datasetId: row.dataset_id,
    registryVersion: row.registry_version,
    relationshipName: row.relationship_name,
    relationshipVersion: row.relationship_version,
    relationshipStatus: parseEnum(
      row.relationship_status,
      REGISTRY_RELATIONSHIP_STATUSES,
      'audit relationship status',
    ),
    actor: row.actor,
    reason: row.reason,
    occurredAt: toIsoString(row.occurred_at),
    ...(row.source_freshness_hash ? { sourceFreshnessHash: row.source_freshness_hash } : {}),
    approval: parseRegistryApprovalMetadata(row.approval),
    ...(row.source ? { source: parseSchemaSourceCoordinate(row.source, 'source') } : {}),
    ...(row.created_at ? { createdAt: toIsoString(row.created_at) } : {}),
  } as DpmRegistryRelationshipAuditEventRow
}

function rowsFromQueryResult<T>(result: QueryResult<T>): readonly T[] {
  return Array.isArray(result) ? result : (result as { rows: readonly T[] }).rows
}

function parseRegistryApprovalMetadata(
  value: unknown,
): DpmRegistryRelationshipRow['approval'] {
  const record = parseJsonRecord(value, 'approval')
  assertRequiredString(record, 'owner', 'approval')
  assertOptionalString(record, 'approvedBy', 'approval')
  assertOptionalString(record, 'approvedAt', 'approval')
  assertOptionalString(record, 'reviewedBy', 'approval')
  assertOptionalString(record, 'reviewedAt', 'approval')
  assertOptionalString(record, 'reason', 'approval')

  return record as DpmRegistryRelationshipRow['approval']
}

function parseRegistryEvidenceArray(
  value: unknown,
): DpmRegistryRelationshipRow['evidence'] {
  const evidence = parseJsonArray(value, 'evidence')
  evidence.forEach((item, index) => {
    const fieldName = `evidence[${index}]`
    const record = parseJsonRecord(item, fieldName)
    assertRequiredString(record, 'kind', fieldName)
    assertRequiredString(record, 'message', fieldName)
    assertOptionalNumber(record, 'score', fieldName)
    if (record.source !== undefined) {
      parseSchemaSourceCoordinate(record.source, `${fieldName}.source`)
    }
    if (record.metadata !== undefined) {
      parseJsonRecord(record.metadata, `${fieldName}.metadata`)
    }
  })

  return evidence as DpmRegistryRelationshipRow['evidence']
}

function parseSchemaSourceCoordinate(
  value: unknown,
  fieldName: string,
): DpmRegistryRelationshipRow['source'] {
  const record = parseJsonRecord(value, fieldName)
  if (record.kind === 'file') {
    assertRequiredString(record, 'filePath', fieldName)
    assertRequiredString(record, 'pointer', fieldName)
    assertOptionalNumber(record, 'line', fieldName)
    assertOptionalNumber(record, 'column', fieldName)
    return record as DpmRegistryRelationshipRow['source']
  }
  if (record.kind === 'db') {
    assertRequiredString(record, 'entity', fieldName)
    assertRequiredString(record, 'id', fieldName)
    assertRequiredString(record, 'pointer', fieldName)
    return record as DpmRegistryRelationshipRow['source']
  }

  throw new Error(`DPM Postgres registry row contains an invalid ${fieldName}.kind.`)
}

function parseStringArray(value: unknown, fieldName: string): string[] {
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return [...value]
  }

  throw new Error(`DPM Postgres registry row contains a non-string-array ${fieldName}.`)
}

function parseEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string,
): T {
  if (typeof value === 'string' && (allowedValues as readonly string[]).includes(value)) {
    return value as T
  }

  throw new Error(`DPM Postgres registry row contains an invalid ${fieldName}.`)
}

function parseJsonRecord(value: unknown, fieldName: string): Record<string, unknown> {
  const parsed = parseJson(value)
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>
  }

  throw new Error(`DPM Postgres registry row contains a non-object JSON value for ${fieldName}.`)
}

function parseJsonArray(value: unknown, fieldName: string): unknown[] {
  const parsed = parseJson(value)
  if (Array.isArray(parsed)) return parsed

  throw new Error(`DPM Postgres registry row contains a non-array JSON value for ${fieldName}.`)
}

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') return value

  return JSON.parse(value)
}

function toIsoString(value: string | Date): string {
  return value instanceof Date ? value.toISOString() : value
}

function assertRequiredString(
  record: Record<string, unknown>,
  key: string,
  fieldName: string,
): void {
  if (typeof record[key] === 'string') return

  throw new Error(`DPM Postgres registry row contains an invalid ${fieldName}.${key}.`)
}

function assertOptionalString(
  record: Record<string, unknown>,
  key: string,
  fieldName: string,
): void {
  if (record[key] === undefined || typeof record[key] === 'string') return

  throw new Error(`DPM Postgres registry row contains an invalid ${fieldName}.${key}.`)
}

function assertOptionalNumber(
  record: Record<string, unknown>,
  key: string,
  fieldName: string,
): void {
  if (record[key] === undefined || typeof record[key] === 'number') return

  throw new Error(`DPM Postgres registry row contains an invalid ${fieldName}.${key}.`)
}
