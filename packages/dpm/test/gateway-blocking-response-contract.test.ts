import { describe, expect, it } from 'vitest'

import {
  createDpmGatewayRuntime,
  createDpmRegistryRepository,
  getDpmGatewayOpenApiDocument,
  type DpmRegistryRelationshipRow,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import { createBlockingRuntimeInput } from './support/gateway-runtime-manifest-fixtures.js'
import { createKafkaProfileArtifact } from './support/gateway-runtime-profile-artifact-fixtures.js'

const blockingResponseCases = [
  {
    path: '/dpm/manifests/validate',
    method: 'post',
    operationId: 'validateDpmManifest',
    schemaName: 'DpmValidationResult',
  },
  {
    path: '/dpm/manifests/compile',
    method: 'post',
    operationId: 'compileDpmManifest',
    schemaName: 'DpmCompileResult',
  },
  {
    path: '/dpm/manifests/dry-run',
    method: 'post',
    operationId: 'dryRunDpmManifest',
    schemaName: 'DpmCompileResult',
  },
  {
    path: '/dpm/profiles/proposals/{proposalId}/review',
    method: 'post',
    operationId: 'reviewDpmProfileProposal',
    schemaName: 'DpmProfileProposalReviewResponse',
  },
  {
    path: '/dpm/profiles/relationship-hints/{relationshipName}/approve',
    method: 'post',
    operationId: 'approveDpmProfileRelationshipHint',
    schemaName: 'DpmProfileRelationshipHintApprovalBlockingResponse',
  },
] as const

type BlockingResponseCase = (typeof blockingResponseCases)[number]
type BlockingResponsePath = BlockingResponseCase['path']
type BlockingResponseMethod = BlockingResponseCase['method']
type GatewayDocument = ReturnType<typeof getDpmGatewayOpenApiDocument>
type GatewaySchemaRef = { $ref?: string }
type GatewayOperation = {
  operationId?: string
  responses?: Record<string, {
    content?: {
      'application/json'?: {
        schema?: GatewaySchemaRef
      }
    }
  }>
}
type GatewayPathItem = Partial<Record<BlockingResponseMethod, GatewayOperation>>

describe('DPM gateway blocking response contract', () => {
  it('documents schema-valid 400 responses for runtime blocking paths', () => {
    const document = getDpmGatewayOpenApiDocument()

    for (const responseCase of blockingResponseCases) {
      const operation = getOperation(document, responseCase.path, responseCase.method)

      expect(operation?.operationId).toBe(responseCase.operationId)
      expect(extractResponseSchemaName(operation, '400')).toBe(responseCase.schemaName)
    }
  })

  it('validates manifest blocking runtime responses against documented 400 schemas', async () => {
    const runtime = createDpmGatewayRuntime()
    const input = createBlockingRuntimeInput()
    const responses = [
      await runtime.validateDpmManifest(input),
      await runtime.compileDpmManifest(input),
      await runtime.dryRunDpmManifest(input),
    ] as const

    for (const response of responses) {
      const schemaName = extractResponseSchemaName(
        getOperation(getDpmGatewayOpenApiDocument(), pathForOperationId(response.operationId), 'post'),
        String(response.statusCode),
      )
      const responseSchema = compileGatewayComponentSchema(schemaName)

      expect(response.statusCode).toBe(400)
      expect(responseSchema(response.body.result), JSON.stringify(responseSchema.errors, null, 2)).toBe(true)
    }
  })

  it('validates profile proposal review blocking runtime responses against the documented 400 schema', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifact()
    const analysis = await runtime.analyzeDpmProfile({ profileArtifact })
    const relationshipHint = analysis.body.result.analysisReport.relationshipHints[0]
    const coordinate = profileArtifact.nodes.find(node => node.id === relationshipHint?.fromNodeId)?.coordinate
    if (!relationshipHint || !coordinate) throw new Error('expected relationship hint and source coordinate')

    const response = await runtime.reviewDpmProfileProposal({
      proposalId: 'proposal:edge:relationship-hint:contract-mismatch',
      status: 'accepted',
      reviewedBy: 'privacy-reviewer',
      reason: 'intentional contract mismatch',
      coordinate,
      relationshipHint,
    })
    const operation = getOperation(
      getDpmGatewayOpenApiDocument(),
      '/dpm/profiles/proposals/{proposalId}/review',
      'post',
    )
    const responseSchema = compileGatewayComponentSchema(extractResponseSchemaName(operation, '400'))

    expect(response.statusCode).toBe(400)
    expect(responseSchema(response.body.result), JSON.stringify(responseSchema.errors, null, 2)).toBe(true)
    expect(diagnosticCodes(response.body.result)).toContain('PROF201')
  })

  it('validates profile relationship hint approval blocking runtime responses against the documented 400 schema', async () => {
    const runtime = createDpmGatewayRuntime()
    const profileArtifact = createKafkaProfileArtifact()
    const analysis = await runtime.analyzeDpmProfile({ profileArtifact })
    const relationshipHint = analysis.body.result.analysisReport.relationshipHints[0]
    if (!relationshipHint) throw new Error('expected relationship hint')
    const registryRows: DpmRegistryRelationshipRow[] = []
    const registryRepository = createDpmRegistryRepository({
      upsertRelationshipRow: row => {
        registryRows.push(row)
      },
      listRelationshipRows: () => registryRows,
    })

    const response = await runtime.approveDpmProfileRelationshipHint({
      profileArtifact,
      relationshipHint,
      relationshipName: 'rel_orders_customer',
      childTableByPathPrefix: {
        'orders.created': 'public.orders',
      },
      confidenceScore: 0.5,
      registryVersion: 'registry-profile-workflow-v1',
      version: '1',
      namespace: 'customer',
      transformStrategy: 'relationship_token',
      orphanPolicy: 'block',
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      reason: 'Low confidence should not be approved.',
      registryRepository,
    })
    const operation = getOperation(
      getDpmGatewayOpenApiDocument(),
      '/dpm/profiles/relationship-hints/{relationshipName}/approve',
      'post',
    )
    const responseSchema = compileGatewayComponentSchema(extractResponseSchemaName(operation, '400'))

    expect(response.statusCode).toBe(400)
    expect(responseSchema(response.body.result), JSON.stringify(responseSchema.errors, null, 2)).toBe(true)
    expect(diagnosticCodes(response.body.result)).toContain('PROF203')
    expect(registryRows).toEqual([])
  })
})

function getOperation(
  document: GatewayDocument,
  path: BlockingResponsePath,
  method: BlockingResponseMethod,
): GatewayOperation {
  const paths = document.paths as Record<string, GatewayPathItem>
  return paths[path]?.[method] ?? {}
}

function extractResponseSchemaName(operation: GatewayOperation, statusCode: string): string {
  return extractComponentName(
    operation?.responses?.[statusCode]?.content?.['application/json']?.schema?.$ref,
  )
}

function extractComponentName(refPath: string | undefined): string {
  const prefix = '#/components/schemas/'
  if (!refPath?.startsWith(prefix)) {
    throw new Error(`Expected component schema ref, got ${refPath ?? '<missing>'}`)
  }
  return refPath.slice(prefix.length)
}

function pathForOperationId(operationId: string): BlockingResponsePath {
  if (operationId === 'validateDpmManifest') return '/dpm/manifests/validate'
  if (operationId === 'compileDpmManifest') return '/dpm/manifests/compile'
  if (operationId === 'dryRunDpmManifest') return '/dpm/manifests/dry-run'
  throw new Error(`Unsupported blocking operation id: ${operationId}`)
}

function diagnosticCodes(result: { diagnostics: ReadonlyArray<{ code: string }> }): string[] {
  return result.diagnostics.map(diagnostic => diagnostic.code)
}
