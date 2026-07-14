export const expectedCompiledRelationshipStepNames = [
  'rel_orders_customer',
] as const

export const expectedCompiledCustomerNamespaceBinding = {
  namespace: 'customer',
  entity: 'customer',
  relationships: ['rel_orders_customer'],
  columns: ['public.customers.customer_no', 'public.orders.customer_no'],
} as const

export const expectedCatalogStaleReasons = [
  'catalog_version_hash_changed',
] as const
