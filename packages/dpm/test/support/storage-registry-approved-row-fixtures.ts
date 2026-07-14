import type { DpmRegistryRelationshipRow } from '../../src/index.js'

import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './storage-registry-snapshot-fixtures.js'

export const approvedStorageRegistryRelationshipRow: DpmRegistryRelationshipRow = {
  datasetId: STORAGE_REGISTRY_DATASET_ID,
  registryVersion: STORAGE_REGISTRY_VERSION,
  canonicalKeyEncodingVersion: 'string-v1',
  relationshipName: 'rel_orders_customer',
  relationshipVersion: '1',
  status: 'approved',
  relationshipType: 'many_to_one',
  parentTable: 'public.customers',
  parentColumns: ['customer_no'],
  childTable: 'public.orders',
  childColumns: ['customer_no'],
  namespace: 'customer',
  transformStrategy: 'relationship_token',
  orphanPolicy: 'block',
  contextColumns: ['tenant_id'],
  confidenceScore: 0.99,
  evidence: [
    {
      kind: 'catalog_fk',
      message: 'orders.customer_no references customers.customer_no',
      score: 0.99,
    },
  ],
  approval: {
    owner: 'privacy-team',
    approvedBy: 'dpo@example.com',
    approvedAt: STORAGE_REGISTRY_EXPORTED_AT,
    reason: 'Relationship is required for customer-scoped pseudonymization.',
  },
  sourceFreshnessHash: 'sha256:storage-catalog-v1',
}
