import { describe, expect, it, vi } from 'vitest'

import {
  createDpmGatewayRuntime,
  createDpmRegistryRepository,
  createRegistrySnapshot,
  getDpmGatewayOpenApiDocument,
  type RegistryRelationshipInput,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './support/storage-registry-snapshot-fixtures.js'
import {
  storageRegistryRows,
} from './support/storage-registry-row-fixtures.js'

describe('DPM gateway registry snapshot export runtime adapter', () => {
  it('routes documented registry snapshot exports to schema-valid repository-backed snapshots', async () => {
    const runtime = createDpmGatewayRuntime()
    const operation = getDpmGatewayOpenApiDocument()
      .paths['/dpm/registry/snapshots/{datasetId}/{registryVersion}']
      .get
    const responseSchema = compileGatewayComponentSchema('DpmRegistrySnapshotResponse')
    const listRelationshipRows = vi.fn(async () => storageRegistryRows)
    const registryRepository = createDpmRegistryRepository({ listRelationshipRows })

    const response = await runtime.exportDpmRegistrySnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'string-v1',
      exportedAt: STORAGE_REGISTRY_EXPORTED_AT,
      registryRepository,
    })

    expect(operation.operationId).toBe('exportDpmRegistrySnapshot')
    expect(operation.parameters).toContainEqual(expect.objectContaining({
      name: 'expectedCanonicalKeyEncodingVersion',
      in: 'query',
      required: false,
      schema: {
        type: 'string',
        enum: ['string-v1', 'typed-v2'],
      },
    }))
    expect(listRelationshipRows).toHaveBeenCalledWith({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
    })
    expect(response.operationId).toBe('exportDpmRegistrySnapshot')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('export-registry-snapshot')
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result).toMatchObject({
      kind: 'dpm.relationship.registry-snapshot.v1',
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      summary: {
        total: 2,
        approved: 1,
        nonExecutable: 1,
      },
    })
    expect(response.body.result.approvedRelationships.map(relationship => relationship.name)).toEqual([
      'rel_orders_customer',
    ])
    expect(response.body.result.nonExecutableRelationships.map(relationship => relationship.status)).toEqual([
      'rejected',
    ])
  })

  it('re-normalizes repository snapshots before returning the runtime response', async () => {
    const runtime = createDpmGatewayRuntime()
    const relationshipInput: RegistryRelationshipInput = {
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
      source: {
        kind: 'db',
        entity: 'relationship',
        id: 'rel_orders_customer',
        pointer: '#/relationships/rel_orders_customer',
      },
      evidence: [
        {
          kind: 'catalog_fk',
          message: 'orders.customer_no references customers.customer_no',
          source: {
            kind: 'db',
            entity: 'foreign_key',
            id: 'orders_customer_no_fkey',
            pointer: '#/foreignKeys/orders_customer_no_fkey',
          },
          metadata: {
            stable: true,
          },
        },
      ],
      approval: {
        owner: 'privacy-team',
        approvedBy: 'dpo@example.com',
        reason: 'Relationship is required for customer-scoped pseudonymization.',
      },
    }
    const repositorySnapshot = createRegistrySnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      canonicalKeyEncodingVersion: 'typed-v2',
      relationships: [relationshipInput],
    })
    const registryRepository = {
      exportSnapshot: vi.fn(async () => repositorySnapshot),
    }

    const response = await runtime.exportDpmRegistrySnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      registryRepository,
    })

    repositorySnapshot.relationships[0]!.evidence[0]!.message = 'mutated after export'
    if (repositorySnapshot.relationships[0]!.evidence[0]!.source?.kind === 'db') {
      repositorySnapshot.relationships[0]!.evidence[0]!.source.pointer = '#/mutated-evidence'
    }
    if (repositorySnapshot.relationships[0]!.source?.kind === 'db') {
      repositorySnapshot.relationships[0]!.source.pointer = '#/mutated-relationship'
    }

    expect(response.body.result).not.toBe(repositorySnapshot)
    expect(response.body.result.canonicalKeyEncodingVersion).toBe('typed-v2')
    expect(response.body.result.relationships[0]?.evidence[0]?.message).toBe(
      'orders.customer_no references customers.customer_no',
    )
    expect(response.body.result.relationships[0]?.evidence[0]?.source).toMatchObject({
      kind: 'db',
      pointer: '#/foreignKeys/orders_customer_no_fkey',
    })
    expect(response.body.result.relationships[0]?.source).toMatchObject({
      kind: 'db',
      pointer: '#/relationships/rel_orders_customer',
    })
  })

  it('rejects custom repository snapshots that violate the expected encoding assertion', async () => {
    const runtime = createDpmGatewayRuntime()
    const registryRepository = {
      exportSnapshot: vi.fn(async () => createRegistrySnapshot({
        datasetId: STORAGE_REGISTRY_DATASET_ID,
        registryVersion: STORAGE_REGISTRY_VERSION,
        relationships: [],
      })),
    }

    await expect(runtime.exportDpmRegistrySnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      expectedCanonicalKeyEncodingVersion: 'typed-v2',
      registryRepository,
    })).rejects.toThrow(
      'expected canonical key encoding typed-v2, but repository returned string-v1',
    )
  })

  it('rejects custom repository snapshots with an encoding-incompatible identity', async () => {
    const runtime = createDpmGatewayRuntime()
    const mismatched = createRegistrySnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      canonicalKeyEncodingVersion: 'typed-v2',
      relationships: [],
    })
    mismatched.identity = `${mismatched.datasetId}@${mismatched.registryVersion}`

    await expect(runtime.exportDpmRegistrySnapshot({
      datasetId: STORAGE_REGISTRY_DATASET_ID,
      registryVersion: STORAGE_REGISTRY_VERSION,
      registryRepository: {
        exportSnapshot: vi.fn(async () => mismatched),
      },
    })).rejects.toThrow('does not match canonical key encoding typed-v2')
  })
})
