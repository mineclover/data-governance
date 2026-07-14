import type {
  GatewayMinimalResponseCase,
} from './gateway-workflow-response-case-types.js'
import {
  createRegistrySnapshot,
  type RegistryRelationshipInput,
} from '../../src/index.js'
import {
  readCommerceDiscoveryReport,
} from './discovery-fixtures.js'

const approvedRegistryRelationshipInput: RegistryRelationshipInput = {
  name: 'rel_orders_customer',
  version: '1',
  status: 'approved',
  type: 'one_to_many',
  parent: {
    table: 'public.customers',
    columns: ['customer_no'],
  },
  child: {
    table: 'public.orders',
    columns: ['customer_no'],
  },
  namespace: 'customer',
  transformStrategy: 'entity_token',
  orphanPolicy: 'block',
  confidenceScore: 0.998,
  evidence: readCommerceDiscoveryReport().candidates[0]!.evidence,
  approval: {
    owner: 'privacy-platform',
    approvedBy: 'privacy-reviewer',
    reason: 'reviewed',
  },
}

export const gatewayRelationshipMinimalResponseCases = [
  ['DpmRelationshipDiscoveryReport', readCommerceDiscoveryReport()],
  ['DpmCandidateImportResponse', {
    imported: 1,
    rejected: 0,
    report: readCommerceDiscoveryReport(),
  }],
  ['DpmRelationshipApprovalResponse', {
    relationshipName: 'rel_orders_customer',
    status: 'approved',
    relationship: approvedRegistryRelationshipInput,
  }],
  ['DpmRegistrySnapshotResponse', createRegistrySnapshot({
    datasetId: 'commerce_ai',
    registryVersion: 'reg-2026-07-01',
    relationships: [approvedRegistryRelationshipInput],
  })],
  ['DpmRegistryAuditEventListResponse', {
    auditEvents: [{
      eventId: 'audit:rel-orders-customer-approved',
      eventType: 'relationship_approved',
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
        approvedBy: 'privacy-reviewer',
        reason: 'reviewed',
      },
    }],
  }],
] as const satisfies readonly GatewayMinimalResponseCase[]
