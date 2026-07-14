export function createUnsafeRelationshipDiagnosticRelationships(
  baseRelationship: Record<string, any>,
) {
  return [
    {
      ...baseRelationship,
      name: 'rel_orders_status',
      parent: {
        table: 'public.order_statuses',
        columns: ['status'],
      },
      child: {
        table: 'public.orders',
        columns: ['amount'],
      },
      namespace: 'order_status',
      transform_strategy: 'keep_code',
    },
    {
      ...baseRelationship,
      name: 'rel_missing_customer',
      parent: {
        table: 'public.customers',
        columns: ['customer_no'],
      },
      child: {
        table: 'public.orders',
        columns: ['customer_no', 'order_id'],
      },
    },
  ]
}

