import { describe, expect, it, vi } from 'vitest'

import {
  createDpmGatewayRuntime,
  getDpmGatewayOpenApiDocument,
  type DpmRegistryRelationshipAuditEventRow,
} from '../src/index.js'
import { compileGatewayComponentSchema } from './support/gateway-schema.js'

describe('DPM gateway registry audit event timeline runtime', () => {
  it('routes documented audit event list requests to schema-valid copied timeline events', async () => {
    const document = getDpmGatewayOpenApiDocument()
    const runtime = createDpmGatewayRuntime()
    const operation = document.paths['/dpm/registry/audit-events/list'].post
    const requestSchemaName = extractRequestSchemaName(operation)
    const responseSchemaName = extractResponseSchemaName(operation)
    const request = {
      datasetId: 'commerce_ai',
      registryVersion: 'registry-profile-workflow-v1',
      relationshipName: 'rel_orders_customer',
    }
    const auditEvent = createRegistryAuditEvent()
    const listRelationshipAuditEvents = vi.fn(() => [auditEvent])
    const requestSchema = compileGatewayComponentSchema(requestSchemaName)
    const responseSchema = compileGatewayComponentSchema(responseSchemaName)

    const response = await runtime.listDpmRegistryRelationshipAuditEvents({
      ...request,
      registryAuditEventRepository: {
        listRelationshipAuditEvents,
      },
    })
    const responseEvent = response.body.result.auditEvents[0]
    if (!responseEvent) throw new Error('expected audit event response')
    responseEvent.approval.reason = 'mutated response event'

    expect(operation.operationId).toBe('listDpmRegistryRelationshipAuditEvents')
    expect(requestSchemaName).toBe('DpmRegistryAuditEventListRequest')
    expect(responseSchemaName).toBe('DpmRegistryAuditEventListResponse')
    expect(requestSchema(request), JSON.stringify(requestSchema.errors, null, 2)).toBe(true)
    expect(response.operationId).toBe('listDpmRegistryRelationshipAuditEvents')
    expect(response.statusCode).toBe(200)
    expect(response.body.command).toBe('list-registry-audit-events')
    expect(listRelationshipAuditEvents).toHaveBeenCalledWith(request)
    expect(responseEvent).not.toBe(auditEvent)
    expect(auditEvent.approval.reason).toBe('Profile hint approval accepted by reviewer.')
    expect(
      responseSchema(response.body.result),
      JSON.stringify(responseSchema.errors, null, 2),
    ).toBe(true)
    expect(response.body.result.auditEvents).toEqual([
      expect.objectContaining({
        eventId: 'audit:rel-orders-customer-approved',
        eventType: 'relationship_approved',
        relationshipName: 'rel_orders_customer',
        relationshipStatus: 'approved',
        actor: 'privacy-reviewer',
        sourceFreshnessHash: 'sha256:profile-analysis-v2',
      }),
    ])
    expect(JSON.stringify(response.body.result)).not.toContain('C-001')
  })
})

function createRegistryAuditEvent(): DpmRegistryRelationshipAuditEventRow {
  return {
    eventId: 'audit:rel-orders-customer-approved',
    eventType: 'relationship_approved',
    datasetId: 'commerce_ai',
    registryVersion: 'registry-profile-workflow-v1',
    relationshipName: 'rel_orders_customer',
    relationshipVersion: '1',
    relationshipStatus: 'approved',
    actor: 'privacy-reviewer',
    reason: 'Profile hint approval accepted by reviewer.',
    occurredAt: '2026-07-07T00:10:00.000Z',
    sourceFreshnessHash: 'sha256:profile-analysis-v2',
    approval: {
      owner: 'privacy-platform',
      approvedBy: 'privacy-reviewer',
      approvedAt: '2026-07-07T00:10:00.000Z',
      reason: 'Profile hint approval accepted by reviewer.',
    },
    source: {
      kind: 'db',
      entity: 'profile_relationship_hint',
      id: 'proposal:orders-customer',
      pointer: '/relationshipHints/orders-customer',
    },
    createdAt: '2026-07-07T00:10:01.000Z',
  }
}

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
    throw new Error(`Unexpected schema ref: ${refPath}`)
  }
  return refPath.slice(prefix.length)
}
