import { describe, expect, it } from 'vitest'

import {
  createDpmGatewayRuntime,
  createRegistrySnapshot,
  getDpmGatewayOpenApiDocument,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'
import { createRuntimeInput } from './support/gateway-runtime-manifest-fixtures.js'

describe('DPM gateway relationship approval runtime adapter', () => {
  it('turns a reviewable discovery candidate into a schema-valid approved registry relationship payload', async () => {
    const runtime = createDpmGatewayRuntime()
    const discovery = await runtime.discoverDpmRelationships(createRuntimeInput())
    const candidate = discovery.body.result.candidates[0]
    if (!candidate) throw new Error('expected a relationship candidate')
    const operation = getDpmGatewayOpenApiDocument().paths['/dpm/relationships/{relationshipName}/approve'].post
    const requestSchema = compileGatewayComponentSchema('DpmRelationshipApprovalRequest')
    const responseSchema = compileGatewayComponentSchema('DpmRelationshipApprovalResponse')
    const request = {
      candidate,
      version: '1',
      namespace: 'customer',
      transformStrategy: 'entity_token',
      orphanPolicy: 'block',
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      reason: 'Customer relationship is required for AI analytics joins.',
      approvedAt: '2026-07-07T00:00:00.000Z',
    } as const

    const response = await runtime.approveDpmRelationshipCandidate({
      relationshipName: 'rel_orders_customer',
      ...request,
    })
    const responseEvidenceMessage = response.body.result.relationship.evidence?.[0]?.message
    const responseEvidenceSource = response.body.result.relationship.evidence?.[0]?.source
    const responseEvidenceMetadata = response.body.result.relationship.evidence?.[0]?.metadata
    const registry = createRegistrySnapshot({
      datasetId: discovery.body.result.datasetId,
      registryVersion: 'reg-runtime-review',
      relationships: [response.body.result.relationship],
    })

    candidate.evidence[0]!.message = 'mutated after approval'
    if (candidate.evidence[0]!.source?.kind === 'db') {
      candidate.evidence[0]!.source.pointer = '#/mutated'
    }
    if (candidate.evidence[0]!.metadata) {
      candidate.evidence[0]!.metadata.mutated = true
    }

    expect(operation.operationId).toBe('approveDpmRelationshipCandidate')
    expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
    expect(response.operationId).toBe('approveDpmRelationshipCandidate')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('approve-relationship-candidate')
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result).toMatchObject({
      relationshipName: 'rel_orders_customer',
      status: 'approved',
      relationship: {
        name: 'rel_orders_customer',
        status: 'approved',
        type: candidate.type,
        parent: candidate.parent,
        child: candidate.child,
        namespace: 'customer',
        transformStrategy: 'entity_token',
        orphanPolicy: 'block',
        confidenceScore: candidate.confidence.score,
        approval: {
          owner: 'privacy-platform',
          approvedBy: 'privacy-reviewer',
          approvedAt: '2026-07-07T00:00:00.000Z',
          reason: 'Customer relationship is required for AI analytics joins.',
        },
      },
    })
    expect(registry.summary.approved).toBe(1)
    expect(registry.approvedRelationships[0]).toMatchObject({
      name: 'rel_orders_customer',
      executable: true,
    })
    expect(response.body.result.relationship.evidence?.[0]?.message).toBe(responseEvidenceMessage)
    expect(response.body.result.relationship.evidence?.[0]?.source).toEqual(responseEvidenceSource)
    expect(response.body.result.relationship.evidence?.[0]?.metadata).toEqual(responseEvidenceMetadata)
  })

  it('rejects non-review relationship candidates before creating approved payloads', async () => {
    const runtime = createDpmGatewayRuntime()
    const discovery = await runtime.discoverDpmRelationships(createRuntimeInput())
    const candidate = discovery.body.result.candidates[0]
    if (!candidate) throw new Error('expected a relationship candidate')

    await expect(runtime.approveDpmRelationshipCandidate({
      relationshipName: 'rel_orders_customer',
      candidate: {
        ...candidate,
        recommendation: 'reject',
      },
      version: '1',
      namespace: 'customer',
      transformStrategy: 'entity_token',
      orphanPolicy: 'block',
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      reason: 'Rejected candidates should not become approved relationships.',
    })).rejects.toThrow(
      `DPM relationship approval requires a reviewable candidate: ${candidate.id} is reject.`,
    )
  })
})
