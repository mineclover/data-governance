export const unsafeRelationshipDiagnosticColumns = [
  {
    table: 'public.customers',
    column: 'customer_no',
    role: 'direct_identifier',
    pii: true,
    transform: { type: 'keep' },
  },
  {
    table: 'public.orders',
    column: 'customer_no',
    role: 'foreign_identifier',
    pii: true,
    transform: { type: 'relationship_token' },
  },
  {
    table: 'public.orders',
    column: 'amount',
    role: 'business_identifier',
    pii: true,
    transform: { type: 'keep' },
  },
  {
    table: 'public.orders',
    column: 'customer_no',
    role: 'foreign_identifier',
    pii: true,
    entity: 'customer',
    relationship: 'rel_orders_status',
    transform: {
      type: 'relationship_token',
      relationship: 'rel_orders_status',
    },
  },
] as const

