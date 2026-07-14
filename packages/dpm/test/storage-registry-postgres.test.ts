import { describe, expect, it, vi } from 'vitest'

import {
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  DpmRegistryApprovedRelationshipConflictError,
  appendDpmPostgresRegistryRelationshipAuditEvent,
  commitDpmPostgresRegistryRelationshipApproval,
  createDpmPostgresRegistryStorage,
  createDpmRegistryRepository,
  isDpmRegistryApprovedRelationshipConflictError,
  listDpmPostgresRegistryRelationshipAuditEvents,
  listDpmPostgresRegistryRelationshipRows,
  upsertDpmPostgresRegistryRelationshipRow,
  type DpmPostgresRegistryQueryClient,
  type DpmRegistryRelationshipAuditEventRow,
  type DpmRegistryRelationshipRow,
} from '../src/index.js'
import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './support/storage-registry-snapshot-fixtures.js'
import {
  approvedStorageRegistryRelationshipRow,
} from './support/storage-registry-approved-row-fixtures.js'

const approvalReason = 'Relationship is required for customer-scoped pseudonymization.'
const approvedRelationshipRow: DpmRegistryRelationshipRow = {
  ...approvedStorageRegistryRelationshipRow,
  relationshipVersion: '2',
  approval: {
    ...approvedStorageRegistryRelationshipRow.approval,
    approvedBy: 'privacy-reviewer',
    reason: approvalReason,
  },
  sourceFreshnessHash: 'sha256:profile-analysis-v2',
  createdAt: STORAGE_REGISTRY_EXPORTED_AT,
  updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
}
const approvalAuditEvent: DpmRegistryRelationshipAuditEventRow = {
  eventId: 'audit:rel-orders-customer-approved',
  eventType: 'relationship_approved',
  datasetId: STORAGE_REGISTRY_DATASET_ID,
  registryVersion: STORAGE_REGISTRY_VERSION,
  relationshipName: 'rel_orders_customer',
  relationshipVersion: '2',
  relationshipStatus: 'approved',
  actor: 'privacy-reviewer',
  reason: approvalReason,
  occurredAt: STORAGE_REGISTRY_EXPORTED_AT,
  sourceFreshnessHash: 'sha256:profile-analysis-v2',
  approval: approvedRelationshipRow.approval,
  createdAt: STORAGE_REGISTRY_EXPORTED_AT,
}

describe('DPM Postgres registry storage adapter', () => {
  it('maps Postgres relationship rows into registry storage rows', async () => {
    const client = createQueuedPostgresClient([
      [toRelationshipDbRow(approvedRelationshipRow, {
        jsonMode: 'string',
        dateMode: 'date',
      })],
    ])

    const rows = await listDpmPostgresRegistryRelationshipRows(client, {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })

    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('from dpm.relationship_registry'),
      [STORAGE_REGISTRY_DATASET_ID, STORAGE_REGISTRY_VERSION],
    )
    expect(rows).toEqual([
      expect.objectContaining({
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        canonicalKeyEncodingVersion: 'string-v1',
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '2',
        evidence: approvedRelationshipRow.evidence,
        approval: approvedRelationshipRow.approval,
        createdAt: STORAGE_REGISTRY_EXPORTED_AT,
        updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
      }),
    ])
  })

  it('atomically claims and reads authoritative registry encoding contracts', async () => {
    const contractRow = toEncodingContractDbRow('typed-v2')
    const client = createQueuedPostgresClient([
      [contractRow],
      [contractRow],
    ])
    const storage = createDpmPostgresRegistryStorage(client)
    if (!storage.claimCanonicalKeyEncodingVersion || !storage.readCanonicalKeyEncodingContract) {
      throw new Error('expected Postgres encoding contract capabilities')
    }

    const claimed = await storage.claimCanonicalKeyEncodingVersion({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      canonicalKeyEncodingVersion: 'typed-v2',
    })
    const read = await storage.readCanonicalKeyEncodingContract({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })

    expect(client.query.mock.calls[0]?.[0]).toContain(
      'insert into dpm.relationship_registry_contracts',
    )
    expect(client.query.mock.calls[0]?.[0]).toContain(
      'on conflict (dataset_id, registry_version)',
    )
    expect(client.query.mock.calls[0]?.[1]).toEqual([
      STORAGE_REGISTRY_DATASET_ID,
      STORAGE_REGISTRY_VERSION,
      'typed-v2',
    ])
    expect(client.query.mock.calls[1]?.[0]).toContain(
      'from dpm.relationship_registry_contracts',
    )
    expect(claimed.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(read?.canonicalKeyEncodingVersion).toBe('typed-v2')
  })

  it('rejects invalid Postgres relationship taxonomy while hydrating rows', async () => {
    const client = createQueuedPostgresClient([
      [{
        ...toRelationshipDbRow(approvedRelationshipRow),
        status: 'archived',
      }],
    ])

    await expect(listDpmPostgresRegistryRelationshipRows(client, {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })).rejects.toThrow('invalid relationship status')
  })

  it('hydrates pre-v2 Postgres rows without the encoding column as string-v1', async () => {
    const legacyRow = toRelationshipDbRow(approvedRelationshipRow) as Record<string, unknown>
    delete legacyRow.canonical_key_encoding_version
    const client = createQueuedPostgresClient([[legacyRow]])

    const rows = await listDpmPostgresRegistryRelationshipRows(client, {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })

    expect(rows[0]?.canonicalKeyEncodingVersion).toBe('string-v1')
  })

  it('rejects unknown persisted canonical key encoding versions', async () => {
    const client = createQueuedPostgresClient([[
      {
        ...toRelationshipDbRow(approvedRelationshipRow),
        canonical_key_encoding_version: 'typed-v3',
      },
    ]])

    await expect(listDpmPostgresRegistryRelationshipRows(client, {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })).rejects.toThrow('must be one of string-v1, typed-v2')
  })

  it('rejects invalid Postgres relationship evidence while hydrating rows', async () => {
    const client = createQueuedPostgresClient([
      [{
        ...toRelationshipDbRow(approvedRelationshipRow),
        evidence: JSON.stringify([{ kind: 'catalog-profiler' }]),
      }],
    ])

    await expect(listDpmPostgresRegistryRelationshipRows(client, {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })).rejects.toThrow('invalid evidence[0].message')
  })

  it('upserts relationship rows and appends audit events through SQL returning rows', async () => {
    const client = createQueuedPostgresClient([
      [toRelationshipDbRow(approvedRelationshipRow)],
      [toAuditEventDbRow(approvalAuditEvent)],
    ])

    const savedRelationship = await upsertDpmPostgresRegistryRelationshipRow(
      client,
      approvedRelationshipRow,
    )
    const savedAuditEvent = await appendDpmPostgresRegistryRelationshipAuditEvent(
      client,
      approvalAuditEvent,
    )

    expect(client.query.mock.calls[0]?.[0]).toContain('insert into dpm.relationship_registry')
    expect(client.query.mock.calls[0]?.[0]).toContain('with claimed_registry_contract as')
    expect(client.query.mock.calls[0]?.[0]).toContain(
      'insert into dpm.relationship_registry_contracts',
    )
    expect(client.query.mock.calls[0]?.[0]).toContain('canonical_key_encoding_version')
    expect(client.query.mock.calls[0]?.[0]).toContain(
      'where dpm.relationship_registry.canonical_key_encoding_version = excluded.canonical_key_encoding_version',
    )
    expect(client.query.mock.calls[0]?.[1]).toEqual(expect.arrayContaining([
      STORAGE_REGISTRY_DATASET_ID,
      STORAGE_REGISTRY_VERSION,
      'string-v1',
      'rel_orders_customer',
      '2',
      'approved',
      'many_to_one',
      JSON.stringify(approvedRelationshipRow.evidence),
      JSON.stringify(approvedRelationshipRow.approval),
    ]))
    expect(client.query.mock.calls[1]?.[0]).toContain('insert into dpm.relationship_registry_audit_events')
    expect(client.query.mock.calls[1]?.[1]).toEqual(expect.arrayContaining([
      approvalAuditEvent.eventId,
      'relationship_approved',
      'privacy-reviewer',
      approvalReason,
      JSON.stringify(approvalAuditEvent.approval),
    ]))
    expect(savedRelationship).toMatchObject({
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
      approval: approvedRelationshipRow.approval,
    })
    expect(savedAuditEvent).toMatchObject({
      eventId: approvalAuditEvent.eventId,
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
    })
  })

  it('maps approved relationship unique index conflicts to structured DPM storage errors', async () => {
    const conflict = Object.assign(
      new Error('duplicate key value violates unique constraint "dpm_relationship_registry_approved_idx"'),
      {
        code: '23505',
        constraint: 'dpm_relationship_registry_approved_idx',
      },
    )
    const client = {
      query: vi.fn(async () => {
        throw conflict
      }),
    }

    try {
      await upsertDpmPostgresRegistryRelationshipRow(client, approvedRelationshipRow)
      throw new Error('expected approved relationship conflict')
    } catch (error) {
      expect(error).toBeInstanceOf(DpmRegistryApprovedRelationshipConflictError)
      expect(isDpmRegistryApprovedRelationshipConflictError(error)).toBe(true)
      if (!isDpmRegistryApprovedRelationshipConflictError(error)) throw error
      expect(error).toMatchObject({
        name: 'DpmRegistryApprovedRelationshipConflictError',
        code: DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
        datasetId: 'commerce_ai',
        registryVersion: 'reg-2026-07-01',
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '2',
        constraint: 'dpm_relationship_registry_approved_idx',
        message: 'DPM registry already has an approved relationship named rel_orders_customer '
          + 'for dataset commerce_ai registry reg-2026-07-01; '
          + 'attempted version 2 conflicts with dpm_relationship_registry_approved_idx.',
      })
      expect((error as Error & { cause?: unknown }).cause).toBe(conflict)
    }
  })

  it('rethrows non-approved-index Postgres errors unchanged', async () => {
    const originalError = Object.assign(
      new Error('duplicate key value violates unique constraint "some_other_idx"'),
      {
        code: '23505',
        constraint: 'some_other_idx',
      },
    )
    const client = {
      query: vi.fn(async () => {
        throw originalError
      }),
    }

    await expect(upsertDpmPostgresRegistryRelationshipRow(
      client,
      approvedRelationshipRow,
    )).rejects.toBe(originalError)
  })

  it('commits approval rows and audit events inside the provided transaction', async () => {
    const transactionClient = createQueuedPostgresClient([
      [toRelationshipDbRow(approvedRelationshipRow)],
      [toAuditEventDbRow(approvalAuditEvent)],
    ])
    const client = {
      query: vi.fn(),
      transaction: vi.fn(operation => operation(transactionClient)),
    }

    const storage = createDpmPostgresRegistryStorage(client)

    const committed = await storage.commitRelationshipApproval({
      relationshipRow: approvedRelationshipRow,
      auditEvent: approvalAuditEvent,
    })

    expect(client.query).not.toHaveBeenCalled()
    expect(client.transaction).toHaveBeenCalledOnce()
    expect(transactionClient.query).toHaveBeenCalledTimes(2)
    expect(committed).toEqual({
      relationshipRow: expect.objectContaining({
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '2',
      }),
      auditEvent: expect.objectContaining({
        eventId: approvalAuditEvent.eventId,
      }),
    })
  })

  it('wraps direct approval commit helper calls in the provided transaction', async () => {
    const transactionClient = createQueuedPostgresClient([
      [toRelationshipDbRow(approvedRelationshipRow)],
      [toAuditEventDbRow(approvalAuditEvent)],
    ])
    const client = {
      query: vi.fn(),
      transaction: vi.fn(operation => operation(transactionClient)),
    }

    const committed = await commitDpmPostgresRegistryRelationshipApproval(client, {
      relationshipRow: approvedRelationshipRow,
      auditEvent: approvalAuditEvent,
    })

    expect(client.query).not.toHaveBeenCalled()
    expect(client.transaction).toHaveBeenCalledOnce()
    expect(transactionClient.query).toHaveBeenCalledTimes(2)
    expect(committed.relationshipRow).toMatchObject({
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
    })
    expect(committed.auditEvent).toMatchObject({
      eventId: approvalAuditEvent.eventId,
    })
  })

  it('exposes transaction-backed approval commits through the repository facade', async () => {
    const transactionClient = createQueuedPostgresClient([
      [toRelationshipDbRow(approvedRelationshipRow)],
      [toAuditEventDbRow(approvalAuditEvent)],
    ])
    const client = createQueuedPostgresClient([
      [toEncodingContractDbRow('string-v1')],
      [],
    ], transactionClient)
    const storage = createDpmPostgresRegistryStorage(client)
    const repository = createDpmRegistryRepository(storage)

    const saved = await repository.saveRelationshipWithAuditEvent?.({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship: {
        name: 'rel_orders_customer',
        version: '2',
        status: 'approved',
        type: 'many_to_one',
        parent: {
          table: 'public.customers',
          columns: ['customer_no'],
        },
        child: {
          table: 'public.orders',
          columns: ['customer_no'],
        },
        namespace: 'customer',
        transformStrategy: 'relationship_token',
        orphanPolicy: 'block',
        evidence: approvedRelationshipRow.evidence,
        approval: approvedRelationshipRow.approval,
      },
      auditEventId: approvalAuditEvent.eventId,
      sourceFreshnessHash: 'sha256:profile-analysis-v2',
      createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })

    if (!saved) throw new Error('expected audit-aware save result')
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('from dpm.relationship_registry'),
      [STORAGE_REGISTRY_DATASET_ID, STORAGE_REGISTRY_VERSION],
    )
    expect(client.transaction).toHaveBeenCalledOnce()
    expect(saved.approvalAuditEvent).toMatchObject({
      eventId: approvalAuditEvent.eventId,
      relationshipName: 'rel_orders_customer',
    })
    expect(saved.relationshipRow).toMatchObject({
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
    })
  })

  it('lists approval audit events through the optional relationship filter', async () => {
    const client = createQueuedPostgresClient([
      [toAuditEventDbRow(approvalAuditEvent, { dateMode: 'date' })],
    ])

    const auditEvents = await listDpmPostgresRegistryRelationshipAuditEvents(client, {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationshipName: 'rel_orders_customer',
    })

    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('($3::text is null or relationship_name = $3)'),
      [STORAGE_REGISTRY_DATASET_ID, STORAGE_REGISTRY_VERSION, 'rel_orders_customer'],
    )
    expect(auditEvents).toEqual([
      expect.objectContaining({
        eventId: approvalAuditEvent.eventId,
        occurredAt: STORAGE_REGISTRY_EXPORTED_AT,
        createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      }),
    ])
  })
})

function createQueuedPostgresClient(
  queuedRows: readonly (readonly unknown[])[],
  transactionClient?: DpmPostgresRegistryQueryClient,
) {
  const queue = [...queuedRows]

  return {
    query: vi.fn(async () => {
      const rows = queue.shift()
      if (!rows) throw new Error('unexpected Postgres registry query')

      return { rows }
    }),
    transaction: vi.fn(async operation => {
      if (!transactionClient) throw new Error('expected transaction client')

      return operation(transactionClient)
    }),
  }
}

function toRelationshipDbRow(
  row: DpmRegistryRelationshipRow,
  options: {
    jsonMode?: 'object' | 'string'
    dateMode?: 'string' | 'date'
  } = {},
) {
  const json = (value: unknown) =>
    options.jsonMode === 'string' ? JSON.stringify(value) : value
  const date = (value: string | undefined) =>
    options.dateMode === 'date' && value ? new Date(value) : value

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
    evidence: json(row.evidence),
    approval: json(row.approval),
    supersedes: row.supersedes ?? null,
    superseded_by: row.supersededBy ?? null,
    source: row.source ? json(row.source) : null,
    source_freshness_hash: row.sourceFreshnessHash ?? null,
    created_at: date(row.createdAt),
    updated_at: date(row.updatedAt),
  }
}

function toEncodingContractDbRow(
  canonicalKeyEncodingVersion: 'string-v1' | 'typed-v2',
) {
  return {
    dataset_id: STORAGE_REGISTRY_DATASET_ID,
    registry_version: STORAGE_REGISTRY_VERSION,
    canonical_key_encoding_version: canonicalKeyEncodingVersion,
    created_at: STORAGE_REGISTRY_EXPORTED_AT,
    updated_at: STORAGE_REGISTRY_EXPORTED_AT,
  }
}

function toAuditEventDbRow(
  row: DpmRegistryRelationshipAuditEventRow,
  options: {
    jsonMode?: 'object' | 'string'
    dateMode?: 'string' | 'date'
  } = {},
) {
  const json = (value: unknown) =>
    options.jsonMode === 'string' ? JSON.stringify(value) : value
  const date = (value: string | undefined) =>
    options.dateMode === 'date' && value ? new Date(value) : value

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
    approval: json(row.approval),
    source: row.source ? json(row.source) : null,
    occurred_at: date(row.occurredAt),
    created_at: date(row.createdAt),
  }
}
