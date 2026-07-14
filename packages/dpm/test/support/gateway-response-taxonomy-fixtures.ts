import type {
  GatewayWorkflowResponseSchemaName,
} from './gateway-workflow-response-schema-fixtures.js'
import {
  readCommerceDiscoveryReport,
} from './discovery-fixtures.js'

type GatewayInvalidResponseTaxonomyCase =
  readonly [GatewayWorkflowResponseSchemaName, Record<string, unknown>, string]

const discoveryReport = readCommerceDiscoveryReport()

export const gatewayInvalidResponseTaxonomyCases = [
  ['DpmRelationshipDiscoveryReport', {
    ...discoveryReport,
    candidates: [{
      ...discoveryReport.candidates[0]!,
      recommendation: 'auto_approve',
    }],
  }, 'unknown recommendation'],
  ['DpmRegistrySnapshotResponse', {
    datasetId: 'commerce_ai',
    registryVersion: 'reg-2026-07-01',
    relationships: [{ name: 'rel_orders_customer', status: 'unknown_status' }],
  }, 'unknown relationship status'],
  ['DpmRegistryAuditEventListResponse', {
    auditEvents: [{
      eventId: 'audit:rel-orders-customer-approved',
      eventType: 'relationship_auto_approved',
      datasetId: 'commerce_ai',
      registryVersion: 'reg-2026-07-01',
      relationshipName: 'rel_orders_customer',
      relationshipVersion: '1',
      relationshipStatus: 'approved',
      actor: 'privacy-reviewer',
      reason: 'reviewed',
      occurredAt: '2026-07-07T00:00:00.000Z',
      approval: {
        owner: 'privacy-platform',
      },
    }],
  }, 'unknown audit event type'],
] as const satisfies readonly GatewayInvalidResponseTaxonomyCase[]
