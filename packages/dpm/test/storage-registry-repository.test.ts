import { describe, expect, it, vi } from 'vitest'

import {
  DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
  createDpmRegistryRepository,
  createDpmRegistryRelationshipRow,
  DpmRegistryApprovedRelationshipConflictError,
  DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES,
  isDpmRegistryApprovedRelationshipConflictError,
  type DpmRegistryRelationshipAuditEventRow,
  type DpmRegistryRelationshipRow,
  type ApprovedRegistryRelationshipInput,
  type DpmRegistryRelationshipSaveInput,
} from '../src/index.js'
import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './support/storage-registry-snapshot-fixtures.js'
import {
  storageRegistryRows,
} from './support/storage-registry-row-fixtures.js'

describe('DPM registry storage repository', () => {
  it('creates a repository that requests rows by dataset and registry version', async () => {
    const listRelationshipRows = vi.fn(async () => storageRegistryRows)
    const repository = createDpmRegistryRepository({ listRelationshipRows })

    const snapshot = await repository.exportSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      exportedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })

    expect(listRelationshipRows).toHaveBeenCalledWith({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })
    expect(snapshot.summary).toMatchObject({
      total: 2,
      approved: 1,
      nonExecutable: 1,
    })
    expect(snapshot.canonicalKeyEncodingVersion).toBe('string-v1')

    await expect(repository.exportSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'typed-v2',
    })).rejects.toThrow(
      'expected canonical key encoding typed-v2, but stored rows use string-v1',
    )
  })

  it('persists approved relationship payloads as canonical storage rows before export', async () => {
    const rows: DpmRegistryRelationshipRow[] = []
    const upsertRelationshipRow = vi.fn((row: DpmRegistryRelationshipRow) => {
      rows.push(row)
    })
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow,
      listRelationshipRows: request =>
        rows.filter(row =>
          row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
        ),
    })
    const relationship: ApprovedRegistryRelationshipInput = {
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
      condition: {
        contextColumns: ['tenant_id'],
        conditionSql: 'orders.tenant_id = customers.tenant_id',
      },
      confidenceScore: 0.98,
      evidence: [
        {
          kind: 'service_code_hint',
          message: 'Profile reviewer mapped orders.customer_no to customers.customer_no.',
          score: 0.98,
          metadata: {
            profileId: 'profile:kafka-orders-created',
            evidenceIds: ['evidence:kafka:orders.created.relationship_hint.customer'],
          },
        },
      ],
      approval: {
        owner: 'privacy-platform',
        approvedBy: 'privacy-reviewer',
        approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
        reason: 'Relationship is required for customer-scoped pseudonymization.',
      },
      source: {
        kind: 'db',
        entity: 'profile_relationship_hint',
        id: 'proposal:orders-customer',
        pointer: '/relationshipHints/orders-customer',
      },
    }

    const saved = await repository.saveRelationship({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship,
      sourceFreshnessHash: 'sha256:profile-analysis-v2',
      createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })
    const stored = rows[0]
    const returnedEvidence = saved.evidence[0]
    if (!stored) throw new Error('expected stored relationship row')
    if (!returnedEvidence) throw new Error('expected returned relationship evidence')

    relationship.parent.columns.push('mutated-parent')
    returnedEvidence.message = 'mutated returned row'
    saved.parentColumns.push('mutated-returned-row')

    expect(upsertRelationshipRow).toHaveBeenCalledWith(expect.objectContaining({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
      status: 'approved',
      relationshipType: 'many_to_one',
      contextColumns: ['tenant_id'],
      conditionSql: 'orders.tenant_id = customers.tenant_id',
      sourceFreshnessHash: 'sha256:profile-analysis-v2',
    }))
    expect(stored).not.toBe(saved)
    expect(stored).toMatchObject({
      canonicalKeyEncodingVersion: 'string-v1',
      parentColumns: ['customer_no'],
      evidence: [
        expect.objectContaining({
          message: 'Profile reviewer mapped orders.customer_no to customers.customer_no.',
          metadata: {
            profileId: 'profile:kafka-orders-created',
            evidenceIds: ['evidence:kafka:orders.created.relationship_hint.customer'],
          },
        }),
      ],
    })

    const snapshot = await repository.exportSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      exportedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })

    expect(snapshot.approvedRelationships).toEqual([
      expect.objectContaining({
        name: 'rel_orders_customer',
        version: '2',
        executable: true,
        parent: {
          table: 'public.customers',
          columns: ['customer_no'],
        },
      }),
    ])

    await expect(repository.saveRelationship({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      canonicalKeyEncodingVersion: 'typed-v2',
      relationship: {
        ...relationship,
        name: 'rel_orders_customer_typed',
        version: '1',
        parent: {
          ...relationship.parent,
          columns: ['customer_no'],
        },
      },
    })).rejects.toThrow(
      'typed-v2 registry saves require storage with atomic claimCanonicalKeyEncodingVersion',
    )
  })

  it('atomically chooses one encoding during concurrent first writes', async () => {
    const rows: DpmRegistryRelationshipRow[] = []
    let registryContract: {
      datasetId: string
      registryVersion: string
      canonicalKeyEncodingVersion: 'string-v1' | 'typed-v2'
    } | undefined
    const repository = createDpmRegistryRepository({
      async claimCanonicalKeyEncodingVersion(input) {
        await Promise.resolve()
        if (!registryContract) {
          registryContract = { ...input }
          return registryContract
        }
        if (registryContract.canonicalKeyEncodingVersion !== input.canonicalKeyEncodingVersion) {
          throw new Error(
            `atomic registry contract already stores ${registryContract.canonicalKeyEncodingVersion}`,
          )
        }
        return registryContract
      },
      readCanonicalKeyEncodingContract: () => registryContract,
      listRelationshipRows: request => rows.filter(row =>
        row.datasetId === request.datasetId && row.registryVersion === request.registryVersion
      ),
      upsertRelationshipRow: row => {
        rows.push(row)
      },
    })

    const [typedWrite, legacyWrite] = await Promise.allSettled([
      repository.saveRelationship({
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: 'registry-concurrent-first-write',
        canonicalKeyEncodingVersion: 'typed-v2',
        relationship: createApprovedRelationship('rel_typed_first', '1'),
      }),
      repository.saveRelationship({
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: 'registry-concurrent-first-write',
        relationship: createApprovedRelationship('rel_legacy_first', '1'),
      }),
    ])

    expect([typedWrite.status, legacyWrite.status].sort()).toEqual(['fulfilled', 'rejected'])
    expect(registryContract?.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(rows).toHaveLength(1)
    expect(rows[0]?.canonicalKeyEncodingVersion).toBe('typed-v2')
  })

  it('appends approved relationship audit events when the storage adapter supports them', async () => {
    const rows: DpmRegistryRelationshipRow[] = []
    const auditEvents: DpmRegistryRelationshipAuditEventRow[] = []
    const upsertRelationshipRow = vi.fn((row: DpmRegistryRelationshipRow) => {
      rows.push(row)
    })
    const appendRelationshipAuditEvent = vi.fn((row: DpmRegistryRelationshipAuditEventRow) => {
      auditEvents.push(row)
    })
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow,
      appendRelationshipAuditEvent,
      listRelationshipRows: request =>
        rows.filter(row =>
          row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
        ),
      listRelationshipAuditEvents: request =>
        auditEvents.filter(row =>
          row.datasetId === request.datasetId
          && row.registryVersion === request.registryVersion
          && (!request.relationshipName || row.relationshipName === request.relationshipName),
        ),
    })
    const relationship: ApprovedRegistryRelationshipInput = {
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
      confidenceScore: 0.98,
      evidence: [
        {
          kind: 'service_code_hint',
          message: 'Profile reviewer mapped orders.customer_no to customers.customer_no.',
          score: 0.98,
        },
      ],
      approval: {
        owner: 'privacy-platform',
        approvedBy: 'privacy-reviewer',
        approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
        reason: 'Relationship is required for customer-scoped pseudonymization.',
      },
      source: {
        kind: 'db',
        entity: 'profile_relationship_hint',
        id: 'proposal:orders-customer',
        pointer: '/relationshipHints/orders-customer',
      },
    }

    const saveResult = await repository.saveRelationshipWithAuditEvent?.({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship,
      auditEventId: 'audit:rel-orders-customer-approved',
      sourceFreshnessHash: 'sha256:profile-analysis-v2',
      createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })
    if (!saveResult) throw new Error('expected save result with approval audit event')
    const saved = saveResult.relationshipRow
    const returnedAuditEvent = saveResult.approvalAuditEvent
    const appended = auditEvents[0]
    if (!appended) throw new Error('expected appended relationship audit event')
    if (!returnedAuditEvent) throw new Error('expected returned relationship audit event')

    saved.approval.reason = 'mutated saved row'
    returnedAuditEvent.reason = 'mutated returned audit event'
    relationship.approval.reason = 'mutated relationship payload'
    const listed = await repository.listRelationshipAuditEvents?.({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationshipName: 'rel_orders_customer',
    })
    const listedEvent = listed?.[0]
    if (!listedEvent) throw new Error('expected listed relationship audit event')
    listedEvent.approval.reason = 'mutated listed event'

    expect(DPM_REGISTRY_RELATIONSHIP_AUDIT_EVENT_TYPES).toEqual(['relationship_approved'])
    expect(returnedAuditEvent).toMatchObject({
      eventId: 'audit:rel-orders-customer-approved',
      eventType: 'relationship_approved',
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
    })
    expect(appendRelationshipAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventId: 'audit:rel-orders-customer-approved',
      eventType: 'relationship_approved',
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '2',
      relationshipStatus: 'approved',
      actor: 'privacy-reviewer',
      reason: 'Relationship is required for customer-scoped pseudonymization.',
      occurredAt: STORAGE_REGISTRY_EXPORTED_AT,
      sourceFreshnessHash: 'sha256:profile-analysis-v2',
    }))
    expect(appended).not.toBe(listedEvent)
    expect(appended).not.toBe(returnedAuditEvent)
    expect(appended.reason).toBe('Relationship is required for customer-scoped pseudonymization.')
    expect(appended.approval.reason).toBe('Relationship is required for customer-scoped pseudonymization.')
    expect(listedEvent).toMatchObject({
      approval: {
        owner: 'privacy-platform',
        approvedBy: 'privacy-reviewer',
        approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
        reason: 'mutated listed event',
      },
      source: {
        kind: 'db',
        entity: 'profile_relationship_hint',
        id: 'proposal:orders-customer',
        pointer: '/relationshipHints/orders-customer',
      },
    })
  })

  it('returns the audit event row produced by a split append adapter', async () => {
    const rows: DpmRegistryRelationshipRow[] = []
    const upsertRelationshipRow = vi.fn((row: DpmRegistryRelationshipRow) => {
      rows.push(row)
    })
    const appendRelationshipAuditEvent = vi.fn((row: DpmRegistryRelationshipAuditEventRow) => ({
      ...row,
      eventId: 'audit:adapter-confirmed-rel-orders-customer-approved',
      createdAt: '2026-07-01T00:00:02.000Z',
    }))
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow,
      appendRelationshipAuditEvent,
      listRelationshipRows: request =>
        rows.filter(row =>
          row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
        ),
    })
    const relationship: ApprovedRegistryRelationshipInput = {
      name: 'rel_orders_customer',
      version: '5',
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
      approval: {
        owner: 'privacy-platform',
        approvedBy: 'privacy-reviewer',
        approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
        reason: 'Relationship is required for customer-scoped pseudonymization.',
      },
    }

    const saveResult = await repository.saveRelationshipWithAuditEvent?.({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship,
      auditEventId: 'audit:requested-rel-orders-customer-approved',
      createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })
    if (!saveResult?.approvalAuditEvent) {
      throw new Error('expected save result with adapter-confirmed approval audit event')
    }

    expect(appendRelationshipAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventId: 'audit:requested-rel-orders-customer-approved',
      relationshipVersion: '5',
    }))
    expect(saveResult.approvalAuditEvent).toMatchObject({
      eventId: 'audit:adapter-confirmed-rel-orders-customer-approved',
      relationshipVersion: '5',
      createdAt: '2026-07-01T00:00:02.000Z',
    })
  })

  it('uses an atomic relationship approval commit hook when the storage adapter supports it', async () => {
    const rows: DpmRegistryRelationshipRow[] = []
    const auditEvents: DpmRegistryRelationshipAuditEventRow[] = []
    const upsertRelationshipRow = vi.fn()
    const appendRelationshipAuditEvent = vi.fn()
    const commitRelationshipApproval = vi.fn(async (input: {
      relationshipRow: DpmRegistryRelationshipRow
      auditEvent: DpmRegistryRelationshipAuditEventRow
    }) => {
      rows.push(input.relationshipRow)
      auditEvents.push(input.auditEvent)
      return {
        relationshipRow: input.relationshipRow,
        auditEvent: input.auditEvent,
      }
    })
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow,
      commitRelationshipApproval,
      appendRelationshipAuditEvent,
      listRelationshipRows: request =>
        rows.filter(row =>
          row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
        ),
      listRelationshipAuditEvents: request =>
        auditEvents.filter(row =>
          row.datasetId === request.datasetId
          && row.registryVersion === request.registryVersion
          && (!request.relationshipName || row.relationshipName === request.relationshipName),
        ),
    })
    const relationship: ApprovedRegistryRelationshipInput = {
      name: 'rel_orders_customer',
      version: '3',
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
      confidenceScore: 0.98,
      evidence: [
        {
          kind: 'service_code_hint',
          message: 'Profile reviewer mapped orders.customer_no to customers.customer_no.',
          score: 0.98,
        },
      ],
      approval: {
        owner: 'privacy-platform',
        approvedBy: 'privacy-reviewer',
        approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
        reason: 'Relationship is required for customer-scoped pseudonymization.',
      },
      source: {
        kind: 'db',
        entity: 'profile_relationship_hint',
        id: 'proposal:orders-customer',
        pointer: '/relationshipHints/orders-customer',
      },
    }

    const saved = await repository.saveRelationship({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship,
      auditEventId: 'audit:rel-orders-customer-approved',
      sourceFreshnessHash: 'sha256:profile-analysis-v3',
      createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })
    const committedRow = rows[0]
    const committedEvent = auditEvents[0]
    if (!committedRow) throw new Error('expected committed relationship row')
    if (!committedEvent) throw new Error('expected committed relationship audit event')

    saved.parentColumns.push('mutated-returned-row')
    saved.approval.reason = 'mutated returned row'
    const listed = await repository.listRelationshipAuditEvents?.({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationshipName: 'rel_orders_customer',
    })
    const listedEvent = listed?.[0]
    if (!listedEvent) throw new Error('expected listed relationship audit event')
    listedEvent.reason = 'mutated listed event'

    expect(commitRelationshipApproval).toHaveBeenCalledWith({
      relationshipRow: expect.objectContaining({
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '3',
        status: 'approved',
        sourceFreshnessHash: 'sha256:profile-analysis-v3',
      }),
      auditEvent: expect.objectContaining({
        eventId: 'audit:rel-orders-customer-approved',
        eventType: 'relationship_approved',
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '3',
        relationshipStatus: 'approved',
        actor: 'privacy-reviewer',
        reason: 'Relationship is required for customer-scoped pseudonymization.',
        sourceFreshnessHash: 'sha256:profile-analysis-v3',
      }),
    })
    expect(upsertRelationshipRow).not.toHaveBeenCalled()
    expect(appendRelationshipAuditEvent).not.toHaveBeenCalled()
    expect(committedRow.parentColumns).toEqual(['customer_no'])
    expect(committedRow.approval.reason).toBe(
      'Relationship is required for customer-scoped pseudonymization.',
    )
    expect(committedEvent.reason).toBe('Relationship is required for customer-scoped pseudonymization.')
    expect(committedEvent).not.toBe(listedEvent)

    const snapshot = await repository.exportSnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      exportedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })

    expect(snapshot.approvedRelationships).toEqual([
      expect.objectContaining({
        name: 'rel_orders_customer',
        version: '3',
        executable: true,
      }),
    ])
  })

  it('creates a writable repository for atomic-only relationship approval storage adapters', async () => {
    const rows: DpmRegistryRelationshipRow[] = []
    const auditEvents: DpmRegistryRelationshipAuditEventRow[] = []
    let registryContract: {
      datasetId: string
      registryVersion: string
      canonicalKeyEncodingVersion: 'string-v1' | 'typed-v2'
    } | undefined
    const repository = createDpmRegistryRepository({
      claimCanonicalKeyEncodingVersion: input => {
        registryContract = { ...input }
        return registryContract
      },
      readCanonicalKeyEncodingContract: () => registryContract,
      commitRelationshipApproval: input => {
        rows.push(input.relationshipRow)
        auditEvents.push(input.auditEvent)
        return input
      },
      listRelationshipRows: request =>
        rows.filter(row =>
          row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
        ),
    })

    await repository.saveRelationship({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      canonicalKeyEncodingVersion: 'typed-v2',
      relationship: {
        name: 'rel_orders_customer',
        version: '4',
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
        approval: {
          owner: 'privacy-platform',
          approvedBy: 'privacy-reviewer',
          approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
          reason: 'Relationship is required for customer-scoped pseudonymization.',
        },
      },
      auditEventId: 'audit:rel-orders-customer-approved-atomic-only',
      createdAt: STORAGE_REGISTRY_EXPORTED_AT,
      updatedAt: STORAGE_REGISTRY_EXPORTED_AT,
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(auditEvents).toEqual([
      expect.objectContaining({
        eventId: 'audit:rel-orders-customer-approved-atomic-only',
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '4',
      }),
    ])
  })

  it('rejects non-approved relationship payloads at the save boundary', async () => {
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow: vi.fn(),
      listRelationshipRows: () => [],
    })
    const rejectedRelationship = {
      name: 'rel_orders_status',
      version: '1',
      status: 'rejected',
      type: 'code_lookup',
      parent: {
        table: 'public.order_statuses',
        columns: ['status_code'],
      },
      child: {
        table: 'public.orders',
        columns: ['status'],
      },
      namespace: 'order_status',
      transformStrategy: 'keep_code',
      orphanPolicy: 'warn',
      approval: {
        owner: 'privacy-team',
        reviewedBy: 'dpo@example.com',
        reason: 'Ambiguous operational status candidate.',
      },
    }
    const saveInput = {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship: rejectedRelationship,
    } as unknown as DpmRegistryRelationshipSaveInput

    await expect(repository.saveRelationship(saveInput))
      .rejects
      .toThrow('DPM registry saveRelationship only accepts approved relationships: rel_orders_status is rejected.')
    expect(() => createDpmRegistryRelationshipRow(saveInput))
      .toThrow('DPM registry saveRelationship only accepts approved relationships: rel_orders_status is rejected.')
  })

  it('rejects approved relationship payloads with incomplete approval metadata at the save boundary', async () => {
    const upsertRelationshipRow = vi.fn()
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow,
      listRelationshipRows: () => [],
    })
    const relationship = {
      name: 'rel_orders_customer',
      version: '1',
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
      approval: {
        owner: 'privacy-team',
      },
    }
    const saveInput = {
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      relationship,
    } as unknown as DpmRegistryRelationshipSaveInput

    await expect(repository.saveRelationship(saveInput))
      .rejects
      .toThrow(
        'DPM registry saveRelationship approved relationship rel_orders_customer is missing approval.approvedBy, approval.reason.',
      )
    expect(() => createDpmRegistryRelationshipRow(saveInput))
      .toThrow(
        'DPM registry saveRelationship approved relationship rel_orders_customer is missing approval.approvedBy, approval.reason.',
      )
    expect(upsertRelationshipRow).not.toHaveBeenCalled()
  })

  it('rejects another approved version for the same relationship name before adapter mutation', async () => {
    const upsertRelationshipRow = vi.fn()
    const appendRelationshipAuditEvent = vi.fn()
    const listRelationshipRows = vi.fn(() => storageRegistryRows)
    const repository = createDpmRegistryRepository({
      upsertRelationshipRow,
      appendRelationshipAuditEvent,
      listRelationshipRows,
    })
    const relationship: ApprovedRegistryRelationshipInput = {
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
      approval: {
        owner: 'privacy-team',
        approvedBy: 'dpo@example.com',
        approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
        reason: 'New version should supersede before becoming active.',
      },
    }

    try {
      await repository.saveRelationship({
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        relationship,
      })
      throw new Error('expected approved relationship conflict')
    } catch (error) {
      expect(error).toBeInstanceOf(DpmRegistryApprovedRelationshipConflictError)
      expect(isDpmRegistryApprovedRelationshipConflictError(error)).toBe(true)
      if (!isDpmRegistryApprovedRelationshipConflictError(error)) throw error
      expect(error).toMatchObject({
        name: 'DpmRegistryApprovedRelationshipConflictError',
        code: DPM_REGISTRY_APPROVED_RELATIONSHIP_CONFLICT_ERROR_CODE,
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        relationshipName: 'rel_orders_customer',
        relationshipVersion: '2',
        constraint: 'dpm_registry_repository_single_approved_relationship_name',
        message: 'DPM registry already has an approved relationship named rel_orders_customer '
          + `for dataset ${STORAGE_REGISTRY_DATASET_ID} registry ${STORAGE_REGISTRY_VERSION}; `
          + 'attempted version 2 conflicts with dpm_registry_repository_single_approved_relationship_name.',
      })
    }
    expect(listRelationshipRows).toHaveBeenCalledWith({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })
    expect(upsertRelationshipRow).not.toHaveBeenCalled()
    expect(appendRelationshipAuditEvent).not.toHaveBeenCalled()
  })
})

function createApprovedRelationship(
  name: string,
  version: string,
): ApprovedRegistryRelationshipInput {
  return {
    name,
    version,
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
    approval: {
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      reason: 'Relationship is required for customer-scoped pseudonymization.',
    },
  }
}
