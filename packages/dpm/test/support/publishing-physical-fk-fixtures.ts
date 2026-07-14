export const expectedPublishingPhysicalForeignKeyRecommendations = [
  {
    kind: 'physical_fk_recommendation',
    relationship: 'rel_orders_customer',
    childTable: 'public.orders',
    childColumns: ['customer_no'],
    parentTable: 'public.customers',
    parentColumns: ['customer_no'],
    applyMode: 'recommendation_only',
    mutation: 'none',
  },
] as const
