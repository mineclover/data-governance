import { describe, expect, it, vi } from 'vitest'

import {
  createDpmGatewayRuntime,
  getDpmGatewayOpenApiDocument,
  resolveDpmGatewayRelationshipDiscoveryRuntimeInput,
} from '../src/index.js'
import {
  readCommerceDiscoveryReportInput,
} from './support/discovery-fixtures.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import { createRuntimeInput } from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway relationship discovery runtime adapter', () => {
  it('routes documented discovery requests to schema-valid catalog-derived reports', async () => {
    const runtime = createDpmGatewayRuntime()
    const input = createRuntimeInput()
    const operation = getDpmGatewayOpenApiDocument().paths['/dpm/relationships/discover'].post
    const requestSchema = compileGatewayComponentSchema('DpmRelationshipDiscoveryRequest')
    const responseSchema = compileGatewayComponentSchema('DpmRelationshipDiscoveryReport')
    const request = {
      manifest: input.manifest,
      catalogSnapshot: {
        ref: 'catalog://commerce/v1',
        versionHash: input.catalog.freshness.versionHash,
      },
    }
    const resolver = {
      resolveCatalogSnapshot: vi.fn(snapshot => {
        expect(snapshot).toEqual(request.catalogSnapshot)
        return input.catalog
      }),
    }

    const runtimeInput = await resolveDpmGatewayRelationshipDiscoveryRuntimeInput({
      request,
      resolver,
    })
    const response = await runtime.discoverDpmRelationships(runtimeInput)

    expect(operation.operationId).toBe('discoverDpmRelationships')
    expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
    expect(response.operationId).toBe('discoverDpmRelationships')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('discover-relationships')
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result).toMatchObject({
      kind: 'dpm.relationship.discovery-report.v1',
      datasetId: 'commerce_ai',
      autoApproveEnabled: false,
      summary: {
        candidateCount: 1,
        reviewCount: 1,
        rejectCount: 0,
        excludedCount: 0,
      },
    })
    expect(response.body.result.candidates[0]).toMatchObject({
      id: 'candidate:fk:public_orders:orders_customer_no_fkey',
      relationshipName: 'rel_orders_customer_no',
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no'],
      },
      warnings: ['unenforced-foreign-key'],
    })
    expect(response.body.result.candidates[0]?.evidence.map(evidence => evidence.kind)).toEqual([
      'column_name_similarity',
      'inclusion_dependency',
      'unique_candidate',
    ])
    expect(response.body.result.candidates.every(candidate => candidate.executable === false)).toBe(true)
    expect(JSON.stringify(response.body.result)).not.toContain('"status":"approved"')
    expect(resolver.resolveCatalogSnapshot).toHaveBeenCalledOnce()
  })

  it('imports candidates as review/reject counts without registry mutation', async () => {
    const runtime = createDpmGatewayRuntime()
    const input = readCommerceDiscoveryReportInput()
    const operation = getDpmGatewayOpenApiDocument().paths['/dpm/relationships/candidates/import'].post
    const responseSchema = compileGatewayComponentSchema('DpmCandidateImportResponse')

    const response = await runtime.importDpmRelationshipCandidates({
      datasetId: input.datasetId,
      generatedAt: input.generatedAt,
      thresholds: input.thresholds,
      candidates: input.candidates,
      exclusions: input.exclusions,
    })

    expect(operation.operationId).toBe('importDpmRelationshipCandidates')
    expect(response.operationId).toBe('importDpmRelationshipCandidates')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('import-relationship-candidates')
    expect(response.body.result).toMatchObject({
      imported: 1,
      rejected: 1,
      report: {
        kind: 'dpm.relationship.discovery-report.v1',
        datasetId: input.datasetId,
        generatedAt: input.generatedAt,
        exclusions: input.exclusions,
        summary: {
          candidateCount: 2,
          reviewCount: 1,
          rejectCount: 1,
          excludedCount: 1,
        },
      },
    })
    expect(response.body.result.report.candidates).toEqual([
      expect.objectContaining({
        id: 'candidate:orders_customer',
        recommendation: 'review',
        executable: false,
      }),
      expect.objectContaining({
        id: 'candidate:orders_status',
        recommendation: 'reject',
        executable: false,
        warnings: ['ambiguous-status-column', 'low-confidence'],
      }),
    ])
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(JSON.stringify(response.body.result)).not.toContain('"status":"approved"')
  })

  it('keeps catalog-derived discovery inside manifest scope', async () => {
    const runtime = createDpmGatewayRuntime()
    const input = createRuntimeInput()
    const manifest = structuredClone(input.manifest) as Record<string, any>
    manifest.scope = {
      include_tables: ['public.orders'],
    }

    const response = await runtime.discoverDpmRelationships({
      manifest,
      catalog: input.catalog,
    })

    expect(response.body.result.summary).toEqual({
      candidateCount: 0,
      reviewCount: 0,
      rejectCount: 0,
      excludedCount: 0,
    })
    expect(response.body.result.candidates).toEqual([])
  })
})
