import { describe, expect, it, vi } from 'vitest'

import {
  createDpmProfileBaselineRow,
  createDpmGatewayRuntime,
  createDpmProfileAnalysisReport,
  createDpmRegistryRepository,
  getDpmGatewayOpenApiDocument,
  resolveDpmGatewayManifestRuntimeInput,
  resolveDpmGatewayRelationshipDiscoveryRuntimeInput,
  summarizeDpmProfileBaselineRow,
  type DpmRegistryRelationshipRow,
  type DpmRegistryRelationshipAuditEventRow,
  type DpmGatewayRelationshipDiscoveryRequest,
  type DpmGatewayRuntime,
  type DpmGatewayRuntimeManifestInput,
  type DpmGatewayRuntimeOperationId,
  type DpmGatewayRuntimeResponse,
  type DpmGatewayManifestRequest,
  type RelationshipCandidate,
  type RelationshipCandidateInput,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import { createRuntimeInput } from './support/gateway-runtime-manifest-fixtures.js'
import {
  createKafkaProfileArtifact,
  createKafkaProfileArtifactWithCustomerNoPresence,
} from './support/profile-analysis-fixtures.js'

type ManifestConsumerOperation = {
  operationId: Extract<
    DpmGatewayRuntimeOperationId,
    'validateDpmManifest' | 'compileDpmManifest' | 'dryRunDpmManifest'
  >
  command: 'validate' | 'compile' | 'dry-run'
  path: '/dpm/manifests/validate' | '/dpm/manifests/compile' | '/dpm/manifests/dry-run'
  requestSchemaName: 'DpmManifestValidationRequest' | 'DpmManifestCompileRequest' | 'DpmManifestDryRunRequest'
  createRequest: (input: DpmGatewayRuntimeManifestInput) => DpmGatewayManifestRequest
  invoke: (
    runtime: DpmGatewayRuntime,
    input: DpmGatewayRuntimeManifestInput,
  ) => Promise<DpmGatewayRuntimeResponse<unknown>>
}

const manifestConsumerOperations = [
  {
    operationId: 'validateDpmManifest',
    command: 'validate',
    path: '/dpm/manifests/validate',
    requestSchemaName: 'DpmManifestValidationRequest',
    createRequest: createManifestRequest,
    invoke: (runtime, input) => runtime.validateDpmManifest(input),
  },
  {
    operationId: 'compileDpmManifest',
    command: 'compile',
    path: '/dpm/manifests/compile',
    requestSchemaName: 'DpmManifestCompileRequest',
    createRequest: createManifestRequest,
    invoke: (runtime, input) => runtime.compileDpmManifest(input),
  },
  {
    operationId: 'dryRunDpmManifest',
    command: 'dry-run',
    path: '/dpm/manifests/dry-run',
    requestSchemaName: 'DpmManifestDryRunRequest',
    createRequest: input => ({
      ...createManifestRequest(input),
      estimatedRows: {
        'public.orders': 7000,
      },
    }),
    invoke: (runtime, input) => runtime.dryRunDpmManifest(input),
  },
] as const satisfies readonly ManifestConsumerOperation[]

describe('DPM gateway consumer smoke', () => {
  it('routes documented manifest operationIds to runtime handlers and schema-valid responses', async () => {
    const document = getDpmGatewayOpenApiDocument()
    const runtime = createDpmGatewayRuntime()

    for (const operationCase of manifestConsumerOperations) {
      const operation = document.paths[operationCase.path].post
      expect(operation.operationId).toBe(operationCase.operationId)
      expect(extractRequestSchemaName(operation)).toBe(operationCase.requestSchemaName)

      const loadedInput = createRuntimeInput()
      const request = operationCase.createRequest(loadedInput)
      const requestSchema = compileGatewayComponentSchema(operationCase.requestSchemaName)
      const runtimeInput = await resolveDpmGatewayManifestRuntimeInput({
        request,
        resolver: createManifestSnapshotResolver(loadedInput),
      })
      const responseSchemaName = extractResponseSchemaName(operation)
      const response = await operationCase.invoke(runtime, runtimeInput)
      const responseSchema = compileGatewayComponentSchema(responseSchemaName)

      expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
      expect(response.operationId).toBe(operationCase.operationId)
      expect(response.statusCode).toBe(200)
      expect(response.body.command).toBe(operationCase.command)
      expect(responseSchema(response.body.result)).toBe(true)
    }
  })

  it('keeps the manifest consumer path relationship-first and raw-value-free', async () => {
    const runtime = createDpmGatewayRuntime()
    const validate = await runtime.validateDpmManifest(createRuntimeInput())
    const compile = await runtime.compileDpmManifest(createRuntimeInput())
    const dryRun = await runtime.dryRunDpmManifest(createRuntimeInput())

    expect(validate.body.result.summary.errors).toBe(0)
    expect(compile.body.result.ok).toBe(true)
    expect(dryRun.body.result).toMatchObject({
      kind: 'dpm.dry-run-report.v1',
      rawValuesIncluded: false,
      impact: {
        namespaces: 1,
        relationships: 1,
        columns: 2,
        piiColumns: 2,
      },
    })
    expect(JSON.stringify(dryRun.body.result)).not.toContain('C-001')
  })

  it('routes the documented relationship workflow into a compile-ready registry snapshot', async () => {
    const document = getDpmGatewayOpenApiDocument()
    const runtime = createDpmGatewayRuntime()
    const loadedInput = createRuntimeInput()
    const discoveryOperation = document.paths['/dpm/relationships/discover'].post
    const discoveryRequestSchemaName = extractRequestSchemaName(discoveryOperation)
    const discoveryResponseSchemaName = extractResponseSchemaName(discoveryOperation)
    const discoveryRequest = createRelationshipDiscoveryRequest(loadedInput)
    const discoveryRequestSchema = compileGatewayComponentSchema(discoveryRequestSchemaName)
    const discoveryResponseSchema = compileGatewayComponentSchema(discoveryResponseSchemaName)
    const discoveryInput = await resolveDpmGatewayRelationshipDiscoveryRuntimeInput({
      request: discoveryRequest,
      resolver: createRelationshipDiscoverySnapshotResolver(loadedInput),
    })

    const discovery = await runtime.discoverDpmRelationships(discoveryInput)
    const discoveryCandidate = discovery.body.result.candidates[0]
    if (!discoveryCandidate) throw new Error('expected a discovered relationship candidate')

    expect(discoveryOperation.operationId).toBe('discoverDpmRelationships')
    expect(discoveryRequestSchemaName).toBe('DpmRelationshipDiscoveryRequest')
    expect(discoveryResponseSchemaName).toBe('DpmRelationshipDiscoveryReport')
    expect(discoveryRequestSchema(discoveryRequest), JSON.stringify(discoveryRequestSchema.errors, null, 2)).toBe(true)
    expect(discovery.operationId).toBe('discoverDpmRelationships')
    expect(discovery.statusCode).toBe(200)
    expect(discovery.body.command).toBe('discover-relationships')
    expect(
      discoveryResponseSchema(discovery.body.result),
      JSON.stringify(discoveryResponseSchema.errors, null, 2),
    ).toBe(true)
    expect(discoveryCandidate).toMatchObject({
      executable: false,
      recommendation: 'review',
      relationshipName: 'rel_orders_customer_no',
    })

    const importOperation = document.paths['/dpm/relationships/candidates/import'].post
    const importRequestSchemaName = extractRequestSchemaName(importOperation)
    const importResponseSchemaName = extractResponseSchemaName(importOperation)
    const importRequest = {
      datasetId: discovery.body.result.datasetId,
      ...(discovery.body.result.generatedAt ? { generatedAt: discovery.body.result.generatedAt } : {}),
      thresholds: discovery.body.result.thresholds,
      candidates: discovery.body.result.candidates.map(toRelationshipCandidateInput),
      exclusions: discovery.body.result.exclusions,
    }
    const importRequestSchema = compileGatewayComponentSchema(importRequestSchemaName)
    const importResponseSchema = compileGatewayComponentSchema(importResponseSchemaName)
    const imported = await runtime.importDpmRelationshipCandidates(importRequest)
    const reviewCandidate = imported.body.result.report.candidates[0]
    if (!reviewCandidate) throw new Error('expected an imported review candidate')

    expect(importOperation.operationId).toBe('importDpmRelationshipCandidates')
    expect(importRequestSchemaName).toBe('DpmCandidateImportRequest')
    expect(importResponseSchemaName).toBe('DpmCandidateImportResponse')
    expect(importRequestSchema(importRequest), JSON.stringify(importRequestSchema.errors, null, 2)).toBe(true)
    expect(imported.operationId).toBe('importDpmRelationshipCandidates')
    expect(imported.statusCode).toBe(200)
    expect(imported.body.command).toBe('import-relationship-candidates')
    expect(
      importResponseSchema(imported.body.result),
      JSON.stringify(importResponseSchema.errors, null, 2),
    ).toBe(true)
    expect(imported.body.result).toMatchObject({
      imported: 1,
      rejected: 0,
      report: {
        datasetId: 'commerce_ai',
        summary: {
          reviewCount: 1,
          rejectCount: 0,
        },
      },
    })

    const approvalOperation = document.paths['/dpm/relationships/{relationshipName}/approve'].post
    const approvalRequestSchemaName = extractRequestSchemaName(approvalOperation)
    const approvalResponseSchemaName = extractResponseSchemaName(approvalOperation)
    const approvalRequest = {
      candidate: reviewCandidate,
      version: '1',
      namespace: 'customer',
      transformStrategy: 'entity_token',
      orphanPolicy: 'block',
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      reason: 'Customer relationship is required for AI analytics joins.',
      approvedAt: '2026-07-07T00:00:00.000Z',
    } as const
    const approvalRequestSchema = compileGatewayComponentSchema(approvalRequestSchemaName)
    const approvalResponseSchema = compileGatewayComponentSchema(approvalResponseSchemaName)
    const approval = await runtime.approveDpmRelationshipCandidate({
      relationshipName: 'rel_orders_customer',
      ...approvalRequest,
    })

    expect(approvalOperation.operationId).toBe('approveDpmRelationshipCandidate')
    expect(approvalRequestSchemaName).toBe('DpmRelationshipApprovalRequest')
    expect(approvalResponseSchemaName).toBe('DpmRelationshipApprovalResponse')
    expect(approvalRequestSchema(approvalRequest), JSON.stringify(approvalRequestSchema.errors, null, 2)).toBe(true)
    expect(approval.operationId).toBe('approveDpmRelationshipCandidate')
    expect(approval.statusCode).toBe(200)
    expect(approval.body.command).toBe('approve-relationship-candidate')
    expect(
      approvalResponseSchema(approval.body.result),
      JSON.stringify(approvalResponseSchema.errors, null, 2),
    ).toBe(true)
    expect(approval.body.result).toMatchObject({
      relationshipName: 'rel_orders_customer',
      status: 'approved',
      relationship: {
        name: 'rel_orders_customer',
        parent: reviewCandidate.parent,
        child: reviewCandidate.child,
      },
    })

    const registryOperation = document.paths['/dpm/registry/snapshots/{datasetId}/{registryVersion}'].get
    const registryResponseSchemaName = extractResponseSchemaName(registryOperation)
    const registryResponseSchema = compileGatewayComponentSchema(registryResponseSchemaName)
    const registryRows: DpmRegistryRelationshipRow[] = []
    const auditEvents: DpmRegistryRelationshipAuditEventRow[] = []
    const upsertRelationshipRow = vi.fn((row: DpmRegistryRelationshipRow) => {
      registryRows.push(row)
    })
    const appendRelationshipAuditEvent = vi.fn((row: DpmRegistryRelationshipAuditEventRow) => {
      auditEvents.push(row)
    })
    const listRelationshipRows = vi.fn(request =>
      registryRows.filter(row =>
        row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
      ),
    )
    const listRelationshipAuditEvents = vi.fn(request =>
      auditEvents.filter(row =>
        row.datasetId === request.datasetId
        && row.registryVersion === request.registryVersion
        && (!request.relationshipName || row.relationshipName === request.relationshipName),
      ),
    )
    const registryRepository = createDpmRegistryRepository({
      upsertRelationshipRow,
      appendRelationshipAuditEvent,
      listRelationshipRows,
      listRelationshipAuditEvents,
    })
    const savedRelationship = await registryRepository.saveRelationship({
      datasetId: discovery.body.result.datasetId,
      registryVersion: loadedInput.registry.registryVersion,
      relationship: approval.body.result.relationship,
      sourceFreshnessHash: loadedInput.catalog.freshness.versionHash,
      createdAt: '2026-07-07T00:05:00.000Z',
      updatedAt: '2026-07-07T00:05:00.000Z',
    })
    const exportedRegistry = await runtime.exportDpmRegistrySnapshot({
      datasetId: 'commerce_ai',
      registryVersion: loadedInput.registry.registryVersion,
      exportedAt: '2026-07-07T00:05:00.000Z',
      registryRepository,
    })

    expect(registryOperation.operationId).toBe('exportDpmRegistrySnapshot')
    expect(registryResponseSchemaName).toBe('DpmRegistrySnapshotResponse')
    expect(exportedRegistry.operationId).toBe('exportDpmRegistrySnapshot')
    expect(exportedRegistry.statusCode).toBe(200)
    expect(exportedRegistry.body.command).toBe('export-registry-snapshot')
    expect(
      registryResponseSchema(exportedRegistry.body.result),
      JSON.stringify(registryResponseSchema.errors, null, 2),
    ).toBe(true)
    expect(exportedRegistry.body.result.approvedRelationships).toEqual([
      expect.objectContaining({
        name: 'rel_orders_customer',
        executable: true,
      }),
    ])
    expect(savedRelationship).toMatchObject({
      datasetId: 'commerce_ai',
      registryVersion: loadedInput.registry.registryVersion,
      relationshipName: 'rel_orders_customer',
      status: 'approved',
    })
    expect(upsertRelationshipRow).toHaveBeenCalledOnce()
    expect(listRelationshipRows).toHaveBeenCalledWith({
      datasetId: 'commerce_ai',
      registryVersion: loadedInput.registry.registryVersion,
    })
    expect(appendRelationshipAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'relationship_approved',
      relationshipName: 'rel_orders_customer',
      relationshipStatus: 'approved',
      actor: 'privacy-reviewer',
    }))

    const auditOperation = document.paths['/dpm/registry/audit-events/list'].post
    const auditRequestSchemaName = extractRequestSchemaName(auditOperation)
    const auditResponseSchemaName = extractResponseSchemaName(auditOperation)
    const auditRequest = {
      datasetId: 'commerce_ai',
      registryVersion: loadedInput.registry.registryVersion,
      relationshipName: 'rel_orders_customer',
    }
    const auditRequestSchema = compileGatewayComponentSchema(auditRequestSchemaName)
    const auditResponseSchema = compileGatewayComponentSchema(auditResponseSchemaName)
    const auditTimeline = await runtime.listDpmRegistryRelationshipAuditEvents({
      ...auditRequest,
      registryAuditEventRepository: {
        listRelationshipAuditEvents,
      },
    })

    expect(auditOperation.operationId).toBe('listDpmRegistryRelationshipAuditEvents')
    expect(auditRequestSchemaName).toBe('DpmRegistryAuditEventListRequest')
    expect(auditResponseSchemaName).toBe('DpmRegistryAuditEventListResponse')
    expect(auditRequestSchema(auditRequest), JSON.stringify(auditRequestSchema.errors, null, 2)).toBe(true)
    expect(auditTimeline.operationId).toBe('listDpmRegistryRelationshipAuditEvents')
    expect(auditTimeline.statusCode).toBe(200)
    expect(auditTimeline.body.command).toBe('list-registry-audit-events')
    expect(listRelationshipAuditEvents).toHaveBeenCalledWith(auditRequest)
    expect(
      auditResponseSchema(auditTimeline.body.result),
      JSON.stringify(auditResponseSchema.errors, null, 2),
    ).toBe(true)
    expect(auditTimeline.body.result.auditEvents).toEqual([
      expect.objectContaining({
        eventType: 'relationship_approved',
        relationshipName: 'rel_orders_customer',
        relationshipStatus: 'approved',
      }),
    ])

    const compileInputSource: DpmGatewayRuntimeManifestInput = {
      ...loadedInput,
      registry: exportedRegistry.body.result,
    }
    const compileOperation = document.paths['/dpm/manifests/compile'].post
    const compileResponseSchemaName = extractResponseSchemaName(compileOperation)
    const compileResponseSchema = compileGatewayComponentSchema(compileResponseSchemaName)
    const compileInput = await resolveDpmGatewayManifestRuntimeInput({
      request: createManifestRequest(compileInputSource),
      resolver: createManifestSnapshotResolver(compileInputSource),
    })
    const compile = await runtime.compileDpmManifest(compileInput)

    expect(compileOperation.operationId).toBe('compileDpmManifest')
    expect(compile.operationId).toBe('compileDpmManifest')
    expect(compile.statusCode).toBe(200)
    expect(compile.body.command).toBe('compile')
    expect(
      compileResponseSchema(compile.body.result),
      JSON.stringify(compileResponseSchema.errors, null, 2),
    ).toBe(true)
    expect(compile.body.result.ok).toBe(true)
    if (!compile.body.result.ok) throw new Error('expected compile success from relationship workflow registry')
    expect(compile.body.result.plan.relationshipSteps).toEqual([
      expect.objectContaining({
        name: 'rel_orders_customer',
        registryStatus: 'approved',
        namespace: 'customer',
      }),
    ])
    expect(compile.body.result.plan.columnSteps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          columnRef: 'public.customers.customer_no',
          relationship: 'rel_orders_customer',
          namespace: 'customer',
        }),
        expect.objectContaining({
          columnRef: 'public.orders.customer_no',
          relationship: 'rel_orders_customer',
          namespace: 'customer',
        }),
      ]),
    )
    expect(JSON.stringify(compile.body.result)).not.toContain('C-001')
  })

  it('routes the documented profile baseline summary operation to a schema-valid runtime response', async () => {
    const document = getDpmGatewayOpenApiDocument()
    const runtime = createDpmGatewayRuntime()
    const operation = document.paths['/dpm/profiles/baselines/summaries'].post
    const requestSchemaName = extractRequestSchemaName(operation)
    const responseSchemaName = extractResponseSchemaName(operation)
    const baseline = createDpmProfileBaselineRow({
      profileArtifact: createKafkaProfileArtifactWithCustomerNoPresence(0.91),
      measuredAt: '2026-07-07T00:00:00.000Z',
      measurementRunHash: 'sha256:consumer-smoke-run',
      storedAt: '2026-07-07T00:05:00.000Z',
    })
    const adapterSummary = summarizeDpmProfileBaselineRow(baseline)
    const request = {
      datasetId: baseline.datasetId,
      profileId: baseline.profileId,
      limit: 1,
    }
    const listProfileBaselineSummaries = vi.fn(async () => [adapterSummary])
    const requestSchema = compileGatewayComponentSchema(requestSchemaName)
    const responseSchema = compileGatewayComponentSchema(responseSchemaName)

    const response = await runtime.listDpmProfileBaselineSummaries({
      ...request,
      profileBaselineRepository: {
        listProfileBaselineSummaries,
      },
    })

    expect(operation.operationId).toBe('listDpmProfileBaselineSummaries')
    expect(requestSchemaName).toBe('DpmProfileBaselineSummaryListRequest')
    expect(responseSchemaName).toBe('DpmProfileBaselineSummaryListResponse')
    expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
    expect(response.operationId).toBe('listDpmProfileBaselineSummaries')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('list-profile-baseline-summaries')
    expect(listProfileBaselineSummaries).toHaveBeenCalledWith(request)
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result.baselineSummaries).toEqual([
      expect.objectContaining({
        baselineRef: baseline.baselineRef,
        measurementId: baseline.measurementId,
        hasAnalysisReport: false,
      }),
    ])
    expect(JSON.stringify(response.body.result)).not.toContain('profileArtifact')
    expect(JSON.stringify(response.body.result)).not.toContain('analysisReport')
  })

  it('routes the documented profile hint approval operation to a schema-valid runtime response', async () => {
    const document = getDpmGatewayOpenApiDocument()
    const runtime = createDpmGatewayRuntime()
    const operation = document.paths['/dpm/profiles/relationship-hints/{relationshipName}/approve'].post
    const requestSchemaName = extractRequestSchemaName(operation)
    const responseSchemaName = extractResponseSchemaName(operation)
    const profileArtifact = createKafkaProfileArtifact()
    const analysisReport = createDpmProfileAnalysisReport({ profileArtifact })
    const relationshipHint = analysisReport.relationshipHints.find(candidate =>
      candidate.id === 'proposal:edge:relationship-hint:hint:orders-created-customer'
    )
    if (!relationshipHint) throw new Error('expected explicit Kafka relationship hint')
    const registryRows: DpmRegistryRelationshipRow[] = []
    const auditEvents: DpmRegistryRelationshipAuditEventRow[] = []
    const upsertRelationshipRow = vi.fn((row: DpmRegistryRelationshipRow) => {
      registryRows.push(row)
    })
    const appendRelationshipAuditEvent = vi.fn((row: DpmRegistryRelationshipAuditEventRow) => {
      auditEvents.push(row)
    })
    const registryRepository = createDpmRegistryRepository({
      upsertRelationshipRow,
      appendRelationshipAuditEvent,
      listRelationshipRows: request =>
        registryRows.filter(row =>
          row.datasetId === request.datasetId && row.registryVersion === request.registryVersion,
        ),
      listRelationshipAuditEvents: request =>
        auditEvents.filter(row =>
          row.datasetId === request.datasetId
          && row.registryVersion === request.registryVersion
          && (!request.relationshipName || row.relationshipName === request.relationshipName),
        ),
    })
    const request = {
      profileArtifact,
      relationshipHint,
      childTableByPathPrefix: {
        'orders.created': 'public.orders',
      },
      registryVersion: 'registry-profile-workflow-v1',
      version: '1',
      namespace: 'customer',
      transformStrategy: 'relationship_token',
      orphanPolicy: 'block',
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      reason: 'Kafka profile hint was approved for customer-scoped pseudonymization.',
      approvedAt: '2026-07-07T00:10:00.000Z',
      auditEventId: 'audit:profile-hint:consumer-smoke-rel-orders-customer-approved',
      exportedAt: '2026-07-07T00:11:00.000Z',
      createdAt: '2026-07-07T00:10:00.000Z',
      updatedAt: '2026-07-07T00:10:00.000Z',
      sourceFreshnessHash: analysisReport.freshness.reportHash,
    } as const
    const requestSchema = compileGatewayComponentSchema(requestSchemaName)
    const responseSchema = compileGatewayComponentSchema(responseSchemaName)

    const response = await runtime.approveDpmProfileRelationshipHint({
      ...request,
      relationshipName: 'rel_orders_customer',
      registryRepository,
    })

    expect(operation.operationId).toBe('approveDpmProfileRelationshipHint')
    expect(requestSchemaName).toBe('DpmProfileRelationshipHintApprovalRequest')
    expect(responseSchemaName).toBe('DpmProfileRelationshipHintApprovalResponse')
    expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
    expect(response.operationId).toBe('approveDpmProfileRelationshipHint')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('approve-profile-relationship-hint')
    expect(upsertRelationshipRow).toHaveBeenCalledOnce()
    expect(appendRelationshipAuditEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventId: 'audit:profile-hint:consumer-smoke-rel-orders-customer-approved',
      relationshipName: 'rel_orders_customer',
      relationshipStatus: 'approved',
    }))
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result).toMatchObject({
      relationshipName: 'rel_orders_customer',
      status: 'approved',
      relationshipWriteReceipt: {
        kind: 'dpm.relationship.registry-write-receipt.v1',
        datasetId: profileArtifact.datasetId,
        registryVersion: 'registry-profile-workflow-v1',
        relationshipName: 'rel_orders_customer',
        relationshipIdentity: `${profileArtifact.datasetId}/rel_orders_customer@1`,
        approvalAuditEventId: 'audit:profile-hint:consumer-smoke-rel-orders-customer-approved',
      },
    })
    expect(JSON.stringify(response.body.result)).not.toContain('C-001')
  })
})

function extractRequestSchemaName(operation: {
  requestBody?: {
    content?: {
      'application/json'?: {
        schema?: {
          $ref?: string
        }
      }
    }
  }
}): string {
  return extractComponentName(operation.requestBody?.content?.['application/json']?.schema?.$ref)
}

function extractResponseSchemaName(operation: {
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            $ref: string
          }
        }
      }
    }
  }
}): string {
  return extractComponentName(operation.responses['200'].content['application/json'].schema.$ref)
}

function extractComponentName(refPath: string | undefined): string {
  const prefix = '#/components/schemas/'
  if (!refPath?.startsWith(prefix)) {
    throw new Error(`Expected component schema ref, got ${refPath ?? '<missing>'}`)
  }
  return refPath.slice(prefix.length)
}

function toRelationshipCandidateInput(candidate: RelationshipCandidate): RelationshipCandidateInput {
  return {
    id: candidate.id,
    relationshipName: candidate.relationshipName,
    type: candidate.type,
    parent: candidate.parent,
    child: candidate.child,
    confidenceScore: candidate.confidence.score,
    evidence: candidate.evidence,
    warnings: candidate.warnings,
  }
}

function createManifestRequest(input: DpmGatewayRuntimeManifestInput): DpmGatewayManifestRequest {
  return {
    manifest: input.manifest,
    catalogSnapshot: {
      ref: 'catalog://commerce/v1',
      versionHash: input.catalog.kind === 'dpm.catalog.snapshot.v1'
        ? input.catalog.freshness.versionHash
        : 'sha256:postgres-input',
    },
    registrySnapshot: {
      ref: 'registry://commerce/v1',
      versionHash: input.registry.registryVersion,
    },
  }
}

function createRelationshipDiscoveryRequest(
  input: DpmGatewayRuntimeManifestInput,
): DpmGatewayRelationshipDiscoveryRequest {
  return {
    manifest: input.manifest,
    catalogSnapshot: {
      ref: 'catalog://commerce/v1',
      versionHash: input.catalog.kind === 'dpm.catalog.snapshot.v1'
        ? input.catalog.freshness.versionHash
        : 'sha256:postgres-input',
    },
  }
}

function createRelationshipDiscoverySnapshotResolver(input: DpmGatewayRuntimeManifestInput) {
  const request = createRelationshipDiscoveryRequest(input)
  return {
    resolveCatalogSnapshot: vi.fn(snapshot => {
      expect(snapshot).toEqual(request.catalogSnapshot)
      return input.catalog
    }),
  }
}

function createManifestSnapshotResolver(input: DpmGatewayRuntimeManifestInput) {
  const request = createManifestRequest(input)
  return {
    resolveCatalogSnapshot: vi.fn(snapshot => {
      expect(snapshot).toEqual(request.catalogSnapshot)
      return input.catalog
    }),
    resolveRegistrySnapshot: vi.fn(snapshot => {
      expect(snapshot).toEqual(request.registrySnapshot)
      return input.registry
    }),
  }
}
