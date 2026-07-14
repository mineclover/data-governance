export const expectedCommerceRegistryIdentity = 'commerce_ai@reg-2026-07-01' as const

export const expectedCommerceRegistryRelationshipIdentities = [
  'commerce_ai/rel_legacy_customer@2',
  'commerce_ai/rel_old_orders_customer@1',
  'commerce_ai/rel_orders_customer@1',
  'commerce_ai/rel_orders_status@1',
  'commerce_ai/rel_tickets_customer@1',
] as const

export const expectedCommerceRegistrySummaryByStatus = {
  approved: 1,
  rejected: 1,
  deprecated: 1,
  superseded: 1,
  proposed: 1,
} as const

export const expectedCommerceApprovedRelationshipNames = [
  'rel_orders_customer',
] as const

export const expectedCommerceNonExecutableStatuses = [
  'deprecated',
  'proposed',
  'rejected',
  'superseded',
] as const

export const expectedCommerceRejectedRelationshipHistory = {
  name: 'rel_orders_status',
  executable: false,
  approval: {
    reason: 'Candidate was ambiguous.',
  },
} as const

export const expectedCommerceDeprecatedRelationshipHistory = {
  name: 'rel_legacy_customer',
  supersededBy: 'rel_orders_customer',
  executable: false,
} as const

export const expectedCommerceSupersededRelationshipHistory = {
  name: 'rel_old_orders_customer',
  executable: false,
} as const
