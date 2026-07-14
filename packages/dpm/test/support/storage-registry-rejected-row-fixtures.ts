import type { DpmRegistryRelationshipRow } from '../../src/index.js'

import {
  STORAGE_REGISTRY_DATASET_ID,
  STORAGE_REGISTRY_EXPORTED_AT,
  STORAGE_REGISTRY_VERSION,
} from './storage-registry-snapshot-fixtures.js'

export const rejectedStorageRegistryRelationshipRow: DpmRegistryRelationshipRow = {
  datasetId: STORAGE_REGISTRY_DATASET_ID,
  registryVersion: STORAGE_REGISTRY_VERSION,
  canonicalKeyEncodingVersion: 'string-v1',
  relationshipName: 'rel_orders_status',
  relationshipVersion: '1',
  status: 'rejected',
  relationshipType: 'code_lookup',
  parentTable: 'public.order_statuses',
  parentColumns: ['status_code'],
  childTable: 'public.orders',
  childColumns: ['status'],
  namespace: 'order_status',
  transformStrategy: 'keep_code',
  orphanPolicy: 'warn',
  contextColumns: [],
  evidence: [],
  approval: {
    owner: 'privacy-team',
    reviewedBy: 'dpo@example.com',
    reviewedAt: STORAGE_REGISTRY_EXPORTED_AT,
    reason: 'Ambiguous operational status candidate.',
  },
  sourceFreshnessHash: 'sha256:storage-catalog-v1',
}
