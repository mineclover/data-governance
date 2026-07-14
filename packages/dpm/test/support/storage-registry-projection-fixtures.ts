export const expectedStorageRegistrySnapshotIdentity = 'commerce_ai@reg-2026-07-01' as const

export const expectedStorageRegistryRelationshipIdentities = [
  'commerce_ai/rel_orders_customer@1',
  'commerce_ai/rel_orders_status@1',
] as const

export const expectedStorageRegistryApprovedRelationshipNames = [
  'rel_orders_customer',
] as const

export const expectedStorageRegistryNonExecutableStatuses = [
  'rejected',
] as const

export const expectedStorageRegistryApprovedRelationship = {
  name: 'rel_orders_customer',
  status: 'approved',
  executable: true,
  namespace: 'customer',
  parent: {
    table: 'public.customers',
    columns: ['customer_no'],
  },
  child: {
    table: 'public.orders',
    columns: ['customer_no'],
  },
  condition: {
    contextColumns: ['tenant_id'],
  },
  approval: {
    owner: 'privacy-team',
    approvedBy: 'dpo@example.com',
    reason: 'Relationship is required for customer-scoped pseudonymization.',
  },
} as const
